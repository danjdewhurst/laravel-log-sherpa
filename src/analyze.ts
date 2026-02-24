import type { LaravelErrorLog, ParsedSummary } from "./types/error";
import { countPatternHits } from "./patternPacks";

export interface SummaryLimits {
  topMessages?: number;
  topFingerprints?: number;
  topContextValues?: number;
}

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

export function summarize(
  logs: LaravelErrorLog[],
  patterns: RegExp[] = [],
  limits: SummaryLimits = {},
): ParsedSummary {
  const topMessagesLimit = limits.topMessages ?? 5;
  const topFingerprintsLimit = limits.topFingerprints ?? 10;
  const topContextValuesLimit = limits.topContextValues ?? 5;
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
    .slice(0, topMessagesLimit);

  const topFingerprints = Object.entries(fpCount)
    .map(([fingerprint, count]) => ({ fingerprint, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topFingerprintsLimit);

  return {
    total: logs.length,
    byLevel,
    topMessages,
    topFingerprints,
    patternHits: countPatternHits(logs, patterns),
    contextHotspots: {
      routes: topCounts(logs.map((l) => l.context?.route), topContextValuesLimit),
      controllers: topCounts(logs.map((l) => l.context?.controller), topContextValuesLimit),
      jobs: topCounts(logs.map((l) => l.context?.job), topContextValuesLimit),
      requestIds: topCounts(logs.map((l) => l.context?.requestId), topContextValuesLimit),
    },
  };
}
