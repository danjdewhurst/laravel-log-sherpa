import type { Formatter, LaravelErrorLog, ParsedSummary } from "../types/error";

export class TableFormatter implements Formatter {
  format(logs: LaravelErrorLog[], summary: ParsedSummary): string {
    const levels = Object.entries(summary.byLevel)
      .map(([lvl, count]) => `${lvl}: ${count}`)
      .join(" | ");

    const top = summary.topMessages
      .map((m, idx) => `${idx + 1}. (${m.count}) ${m.message}`)
      .join("\n");

    return [
      "Laravel Log Sherpa Summary",
      "=".repeat(40),
      `Total errors: ${summary.total}`,
      `Levels: ${levels || "none"}`,
      "",
      "Top messages:",
      top || "none",
      "",
      "Recent entries:",
      ...logs.slice(0, 5).map((l) => `- [${l.level}] ${l.message}`),
    ].join("\n");
  }
}
