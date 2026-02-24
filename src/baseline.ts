import { writeFileSync } from "node:fs";
import type { LaravelErrorLog } from "./types/error";

export interface BaselineSnapshot {
  createdAt: string;
  total: number;
  byFingerprint: Record<string, number>;
}

export interface BaselineCheck {
  newFingerprints: Array<{ fingerprint: string; count: number }>;
  resolvedFingerprints: Array<{ fingerprint: string; count: number }>;
}

function countByFingerprint(logs: LaravelErrorLog[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const log of logs) {
    const fp = log.fingerprint;
    if (!fp) continue;
    out[fp] = (out[fp] ?? 0) + 1;
  }
  return out;
}

export function createBaseline(logs: LaravelErrorLog[]): BaselineSnapshot {
  return {
    createdAt: new Date().toISOString(),
    total: logs.length,
    byFingerprint: countByFingerprint(logs),
  };
}

export function saveBaseline(snapshot: BaselineSnapshot, file: string): void {
  writeFileSync(file, JSON.stringify(snapshot, null, 2));
}

export async function loadBaseline(file: string): Promise<BaselineSnapshot> {
  return (await Bun.file(file).json()) as BaselineSnapshot;
}

export function checkBaseline(baseline: BaselineSnapshot, current: LaravelErrorLog[]): BaselineCheck {
  const currentMap = countByFingerprint(current);
  const newFingerprints = Object.entries(currentMap)
    .filter(([fp]) => !(fp in baseline.byFingerprint))
    .map(([fingerprint, count]) => ({ fingerprint, count }))
    .sort((a, b) => b.count - a.count);

  const resolvedFingerprints = Object.entries(baseline.byFingerprint)
    .filter(([fp]) => !(fp in currentMap))
    .map(([fingerprint, count]) => ({ fingerprint, count }))
    .sort((a, b) => b.count - a.count);

  return { newFingerprints, resolvedFingerprints };
}

export function formatBaselineCheckReport(result: BaselineCheck, limit = 20): string {
  const lines = [
    "Baseline check",
    "-".repeat(40),
    `New fingerprints: ${result.newFingerprints.length}`,
    ...result.newFingerprints.slice(0, limit).map((fp) => `+ ${fp.fingerprint} (${fp.count})`),
    `Resolved fingerprints: ${result.resolvedFingerprints.length}`,
    ...result.resolvedFingerprints.slice(0, limit).map((fp) => `- ${fp.fingerprint} (${fp.count})`),
  ];
  return lines.join("\n");
}
