import type { LaravelErrorLog } from "./types/error";

export interface CompareResult {
  newErrors: LaravelErrorLog[];
  resolvedErrors: LaravelErrorLog[];
  unchanged: LaravelErrorLog[];
}

export function compareLogs(oldLogs: LaravelErrorLog[], newLogs: LaravelErrorLog[]): CompareResult {
  const oldByFp = new Map<string, LaravelErrorLog>();
  for (const log of oldLogs) {
    if (log.fingerprint) oldByFp.set(log.fingerprint, log);
  }

  const newByFp = new Map<string, LaravelErrorLog>();
  for (const log of newLogs) {
    if (log.fingerprint) newByFp.set(log.fingerprint, log);
  }

  const newErrors = Array.from(newByFp.entries())
    .filter(([fp]) => !oldByFp.has(fp))
    .map(([, log]) => log);

  const resolvedErrors = Array.from(oldByFp.entries())
    .filter(([fp]) => !newByFp.has(fp))
    .map(([, log]) => log);

  const unchanged = Array.from(newByFp.entries())
    .filter(([fp]) => oldByFp.has(fp))
    .map(([, log]) => log);

  return { newErrors, resolvedErrors, unchanged };
}
