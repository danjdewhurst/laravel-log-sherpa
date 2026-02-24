import type { LaravelErrorLog, ParsedSummary } from "../types/error";

interface DigestOptions {
  top?: number;
  includeFingerprints?: boolean;
}

function top(lines: Array<{ message: string; count: number }>, limit = 3): string[] {
  return lines.slice(0, limit).map((m) => `${m.count}× ${m.message}`);
}

function topFingerprints(lines: Array<{ fingerprint: string; count: number }>, limit = 3): string[] {
  return lines.slice(0, limit).map((m) => `${m.count}× ${m.fingerprint}`);
}

export function formatSlackDigest(
  _logs: LaravelErrorLog[],
  summary: ParsedSummary,
  options: DigestOptions = {},
): string {
  const limit = options.top ?? 3;
  const lines = [
    `*Laravel Log Sherpa Incident Digest*`,
    `• Total: *${summary.total}*`,
    `• Levels: ${Object.entries(summary.byLevel)
      .map(([level, count]) => `${level}:${count}`)
      .join(" | ")}`,
    "• Top messages:",
    ...top(summary.topMessages, limit).map((l) => `  - ${l}`),
  ];

  if (options.includeFingerprints !== false) {
    lines.push("• Top fingerprints:", ...topFingerprints(summary.topFingerprints, limit).map((l) => `  - ${l}`));
  }

  return lines.join("\n");
}

export function formatDiscordDigest(
  _logs: LaravelErrorLog[],
  summary: ParsedSummary,
  options: DigestOptions = {},
): string {
  const limit = options.top ?? 3;
  const lines = [
    `**Laravel Log Sherpa Incident Digest**`,
    `- Total: **${summary.total}**`,
    `- Levels: ${Object.entries(summary.byLevel)
      .map(([level, count]) => `${level}:${count}`)
      .join(" | ")}`,
    "- Top messages:",
    ...top(summary.topMessages, limit).map((l) => `  - ${l}`),
  ];

  if (options.includeFingerprints !== false) {
    lines.push("- Top fingerprints:", ...topFingerprints(summary.topFingerprints, limit).map((l) => `  - ${l}`));
  }

  return lines.join("\n");
}
