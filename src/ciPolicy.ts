import type { LaravelErrorLog, ParsedSummary } from "./types/error";

export interface CiPolicy {
  failOnLevel?: Record<string, number>;
  failOnPatterns?: RegExp[];
}

export interface CiPolicyResult {
  ok: boolean;
  violations: string[];
  exitCode: number;
}

export function evaluateCiPolicy(
  logs: LaravelErrorLog[],
  summary: ParsedSummary,
  policy: CiPolicy,
): CiPolicyResult {
  const violations: string[] = [];

  for (const [level, threshold] of Object.entries(policy.failOnLevel ?? {})) {
    const count = summary.byLevel[level] ?? 0;
    if (count >= threshold) {
      violations.push(`level '${level}' count ${count} >= threshold ${threshold}`);
    }
  }

  for (const pattern of policy.failOnPatterns ?? []) {
    const count = logs.filter(
      (log) => pattern.test(log.message) || log.stack.some((line) => pattern.test(line)),
    ).length;
    if (count > 0) {
      violations.push(`pattern /${pattern.source}/ matched ${count} logs`);
    }
  }

  return {
    ok: violations.length === 0,
    violations,
    exitCode: violations.length === 0 ? 0 : 2,
  };
}

export function parseLevelThresholds(input: string[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const item of input) {
    const [rawLevel, rawCount] = item.split("=");
    if (!rawLevel || !rawCount) throw new Error(`Invalid level threshold '${item}', expected level=count`);
    const count = Number(rawCount);
    if (!Number.isFinite(count) || count < 0) throw new Error(`Invalid threshold count in '${item}'`);
    out[rawLevel.toLowerCase()] = count;
  }
  return out;
}
