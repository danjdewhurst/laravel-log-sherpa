import type { Formatter, LaravelErrorLog, ParsedSummary } from "../types/error";

export class TableFormatter implements Formatter {
  format(logs: LaravelErrorLog[], summary: ParsedSummary): string {
    const levels = Object.entries(summary.byLevel)
      .map(([lvl, count]) => `${lvl}: ${count}`)
      .join(" | ");

    const top = summary.topMessages
      .map((m, idx) => `${idx + 1}. (${m.count}) ${m.message}`)
      .join("\n");

    const fingerprints = summary.topFingerprints
      .slice(0, 5)
      .map((fp) => `- ${fp.fingerprint}: ${fp.count}`)
      .join("\n");

    const patternHits = Object.entries(summary.patternHits)
      .map(([pattern, count]) => `${pattern}: ${count}`)
      .join(" | ");

    return [
      "Laravel Log Sherpa Summary",
      "=".repeat(40),
      `Total errors: ${summary.total}`,
      `Levels: ${levels || "none"}`,
      `Pattern hits: ${patternHits || "none"}`,
      "",
      "Top messages:",
      top || "none",
      "",
      "Top fingerprints:",
      fingerprints || "none",
      "",
      "Recent entries:",
      ...logs.slice(0, 5).map((l) => `- [${l.level}] ${l.message}`),
    ].join("\n");
  }
}
