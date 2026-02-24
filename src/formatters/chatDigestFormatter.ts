import type { LaravelErrorLog, ParsedSummary } from "../types/error";

function top(lines: Array<{ message: string; count: number }>, limit = 3): string[] {
  return lines.slice(0, limit).map((m) => `${m.count}× ${m.message}`);
}

export function formatSlackDigest(_logs: LaravelErrorLog[], summary: ParsedSummary): string {
  const lines = [
    `*Laravel Log Sherpa Incident Digest*`,
    `• Total: *${summary.total}*`,
    `• Levels: ${Object.entries(summary.byLevel)
      .map(([level, count]) => `${level}:${count}`)
      .join(" | ")}`,
    "• Top messages:",
    ...top(summary.topMessages).map((l) => `  - ${l}`),
  ];
  return lines.join("\n");
}

export function formatDiscordDigest(_logs: LaravelErrorLog[], summary: ParsedSummary): string {
  const lines = [
    `**Laravel Log Sherpa Incident Digest**`,
    `- Total: **${summary.total}**`,
    `- Levels: ${Object.entries(summary.byLevel)
      .map(([level, count]) => `${level}:${count}`)
      .join(" | ")}`,
    "- Top messages:",
    ...top(summary.topMessages).map((l) => `  - ${l}`),
  ];
  return lines.join("\n");
}
