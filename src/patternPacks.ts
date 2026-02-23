import type { LaravelErrorLog } from "./types/error";

export const PATTERN_PACKS: Record<string, RegExp[]> = {
  database: [/sqlstate/i, /connection refused/i, /deadlock/i, /query exception/i],
  auth: [/unauthenticated/i, /csrf token mismatch/i, /authorization/i, /token expired/i],
  queue: [/queue/i, /failed job/i, /horizon/i, /retry/i],
  cache: [/redis/i, /memcached/i, /cache/i],
};

export function resolvePatternPacks(names: string[]): RegExp[] {
  return names.flatMap((name) => PATTERN_PACKS[name] ?? []);
}

export function countPatternHits(logs: LaravelErrorLog[], patterns: RegExp[]): Record<string, number> {
  const hits: Record<string, number> = {};
  for (const pattern of patterns) {
    const label = pattern.source;
    let count = 0;
    for (const log of logs) {
      if (pattern.test(log.message) || log.stack.some((line) => pattern.test(line))) {
        count += 1;
      }
    }
    if (count > 0) hits[label] = count;
  }
  return hits;
}
