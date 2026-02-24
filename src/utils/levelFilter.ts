import type { LaravelErrorLog } from "../types/error";

function normalize(level: string): string {
  return level.trim().toLowerCase();
}

export function filterByLevels(
  logs: LaravelErrorLog[],
  includeLevels: string[] = [],
  excludeLevels: string[] = [],
): LaravelErrorLog[] {
  const includeSet = new Set(includeLevels.map(normalize).filter(Boolean));
  const excludeSet = new Set(excludeLevels.map(normalize).filter(Boolean));

  return logs.filter((log) => {
    const level = normalize(log.level);
    if (includeSet.size > 0 && !includeSet.has(level)) {
      return false;
    }
    if (excludeSet.has(level)) {
      return false;
    }
    return true;
  });
}
