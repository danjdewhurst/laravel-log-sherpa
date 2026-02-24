import type { LaravelErrorLog } from "../types/error";

export function filterByPattern(logs: LaravelErrorLog[], pattern?: string): LaravelErrorLog[] {
  if (!pattern) return logs;

  let regex: RegExp;
  try {
    regex = new RegExp(pattern, "i");
  } catch {
    throw new Error(`Invalid regex for --message-match: ${pattern}`);
  }

  return logs.filter((log) => regex.test(log.message) || log.stack.some((line) => regex.test(line)));
}
