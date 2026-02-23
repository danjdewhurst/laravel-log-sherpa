import type { LaravelErrorLog, ParsedSummary } from "./types/error";

export function summarize(logs: LaravelErrorLog[]): ParsedSummary {
  const byLevel: Record<string, number> = {};
  const messageCount: Record<string, number> = {};

  for (const log of logs) {
    byLevel[log.level] = (byLevel[log.level] ?? 0) + 1;
    messageCount[log.message] = (messageCount[log.message] ?? 0) + 1;
  }

  const topMessages = Object.entries(messageCount)
    .map(([message, count]) => ({ message, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    total: logs.length,
    byLevel,
    topMessages,
  };
}
