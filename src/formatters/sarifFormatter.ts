import type { LaravelErrorLog, ParsedSummary } from "../types/error";

export function formatSarif(logs: LaravelErrorLog[], summary: ParsedSummary): string {
  const rules = Object.keys(summary.byLevel).map((level) => ({
    id: `laravel-${level}`,
    shortDescription: { text: `Laravel ${level} log entry` },
    defaultConfiguration: { level: level === "error" ? "error" : "warning" },
  }));

  const results = logs.map((log) => ({
    ruleId: `laravel-${log.level}`,
    message: { text: log.message },
    level: log.level === "error" ? "error" : "warning",
    locations: [
      {
        physicalLocation: {
          artifactLocation: { uri: "laravel.log" },
          region: { snippet: { text: log.raw } },
        },
      },
    ],
  }));

  return JSON.stringify(
    {
      version: "2.1.0",
      $schema:
        "https://docs.oasis-open.org/sarif/sarif/v2.1.0/cs01/schemas/sarif-schema-2.1.0.json",
      runs: [{ tool: { driver: { name: "Laravel Log Sherpa", rules } }, results }],
    },
    null,
    2,
  );
}
