import type { Formatter, LaravelErrorLog, ParsedSummary } from "../types/error";

export class MarkdownFormatter implements Formatter {
  format(logs: LaravelErrorLog[], summary: ParsedSummary): string {
    const lines: string[] = [];
    lines.push("# Laravel Log Sherpa Summary");
    lines.push("");
    lines.push(`- Total errors: **${summary.total}**`);
    lines.push(`- Levels: ${Object.entries(summary.byLevel).map(([k, v]) => `${k}: ${v}`).join(", ") || "none"}`);
    lines.push("");
    lines.push("## Top Messages");
    if (summary.topMessages.length === 0) {
      lines.push("- none");
    } else {
      for (const msg of summary.topMessages) {
        lines.push(`- (${msg.count}) ${msg.message}`);
      }
    }
    lines.push("");
    lines.push("## Recent Entries");
    for (const log of logs.slice(0, 10)) {
      lines.push(`- [${log.level}] ${log.message}`);
    }
    return lines.join("\n");
  }
}
