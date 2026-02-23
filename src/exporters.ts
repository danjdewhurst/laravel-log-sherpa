import { writeFileSync } from "node:fs";
import type { LaravelErrorLog } from "./types/error";

export function exportOtel(logs: LaravelErrorLog[], file: string): void {
  const payload = {
    resourceLogs: [
      {
        resource: { attributes: [{ key: "service.name", value: { stringValue: "laravel-log-sherpa" } }] },
        scopeLogs: [
          {
            scope: { name: "log-sherpa" },
            logRecords: logs.map((log) => ({
              timeUnixNano: `${Date.parse(log.timestamp.replace(" ", "T") + "Z") * 1_000_000}`,
              severityText: log.level.toUpperCase(),
              body: { stringValue: log.message },
              attributes: [
                { key: "log.fingerprint", value: { stringValue: log.fingerprint ?? "" } },
                { key: "log.environment", value: { stringValue: log.environment ?? "" } },
              ],
            })),
          },
        ],
      },
    ],
  };

  writeFileSync(file, JSON.stringify(payload, null, 2));
}

export function exportSentry(logs: LaravelErrorLog[], file: string): void {
  const payload = logs.map((log) => ({
    event_id: (log.fingerprint ?? "").replace(/^fp_/, "").padEnd(32, "0").slice(0, 32),
    timestamp: log.timestamp,
    level: log.level,
    message: { formatted: log.message },
    extra: { stack: log.stack, fingerprint: log.fingerprint, environment: log.environment },
  }));

  writeFileSync(file, JSON.stringify(payload, null, 2));
}
