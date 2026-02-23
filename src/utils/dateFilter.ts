import type { LaravelErrorLog } from "../types/error";

function normalizeLaravelTimestamp(ts: string): string {
  return ts.includes("T") ? ts : ts.replace(" ", "T") + "Z";
}

export function filterByDateRange(
  logs: LaravelErrorLog[],
  from?: string,
  to?: string,
): LaravelErrorLog[] {
  const fromDate = from ? new Date(from) : undefined;
  const toDate = to ? new Date(to) : undefined;

  if (fromDate && Number.isNaN(fromDate.valueOf())) {
    throw new Error(`Invalid --from date: ${from}`);
  }
  if (toDate && Number.isNaN(toDate.valueOf())) {
    throw new Error(`Invalid --to date: ${to}`);
  }

  return logs.filter((log) => {
    const current = new Date(normalizeLaravelTimestamp(log.timestamp));
    if (Number.isNaN(current.valueOf())) return false;
    if (fromDate && current < fromDate) return false;
    if (toDate && current > toDate) return false;
    return true;
  });
}
