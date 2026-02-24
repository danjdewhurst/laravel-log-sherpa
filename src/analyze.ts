import type { LaravelErrorLog, ParsedSummary } from "./types/error";
import { countPatternHits } from "./patternPacks";

function topCounts(values: Array<string | undefined>, limit: number): Array<{ key: string; count: number }> {
  const counts: Record<string, number> = {};
  for (const value of values) {
    if (!value) continue;
    counts[value] = (counts[value] ?? 0) + 1;
  }

  return Object.entries(counts)
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

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
    contextHotspots: {
      routes: topCounts(logs.map((l) => l.context?.route), 5),
      controllers: topCounts(logs.map((l) => l.context?.controller), 5),
      jobs: topCounts(logs.map((l) => l.context?.job), 5),
      requestIds: topCounts(logs.map((l) => l.context?.requestId), 5),
    },
  };
}
