import type { LaravelErrorLog, ParsedSummary } from "./types/error";
import { countPatternHits } from "./patternPacks";

export function summarize(logs: LaravelErrorLog[], patterns: RegExp[] = []): ParsedSummary {
  const byLevel: Record<string, number> = {};
  const messageCount: Record<string, number> = {};
  const fpCount: Record<string, number> = {};

  for (const log of logs) {
    byLevel[log.level] = (byLevel[log.level] ?? 0) + 1;
    messageCount[log.message] = (messageCount[log.message] ?? 0) + 1;
    if (log.fingerprint) {
      fpCount[log.fingerprint] = (fpCount[log.fingerprint] ?? 0) + 1;
    }
  }

  const topMessages = Object.entries(messageCount)
    .map(([message, count]) => ({ message, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const topFingerprints = Object.entries(fpCount)
    .map(([fingerprint, count]) => ({ fingerprint, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    total: logs.length,
    byLevel,
    topMessages,
    topFingerprints,
    patternHits: countPatternHits(logs, patterns),
  };
}
