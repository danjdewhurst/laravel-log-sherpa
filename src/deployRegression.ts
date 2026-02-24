import type { LaravelErrorLog } from "./types/error";

export interface DeployRegressionResult {
  sinceDeploy: string;
  beforeCount: number;
  afterCount: number;
  newFingerprints: Array<{ fingerprint: string; count: number }>;
}

export function computeDeployRegression(logs: LaravelErrorLog[], sinceDeploy: string): DeployRegressionResult {
  const since = Date.parse(sinceDeploy);
  if (Number.isNaN(since)) {
    throw new Error(`Invalid --since-deploy date: ${sinceDeploy}`);
  }

  const before = logs.filter((log) => Date.parse(log.timestamp) < since);
  const after = logs.filter((log) => Date.parse(log.timestamp) >= since);

  const beforeSet = new Set(before.map((l) => l.fingerprint).filter(Boolean) as string[]);
  const afterCounts = new Map<string, number>();

  for (const log of after) {
    if (!log.fingerprint || beforeSet.has(log.fingerprint)) continue;
    afterCounts.set(log.fingerprint, (afterCounts.get(log.fingerprint) ?? 0) + 1);
  }

  const newFingerprints = [...afterCounts.entries()]
    .map(([fingerprint, count]) => ({ fingerprint, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    sinceDeploy,
    beforeCount: before.length,
    afterCount: after.length,
    newFingerprints,
  };
}
