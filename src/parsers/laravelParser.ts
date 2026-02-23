import type { LaravelErrorLog } from "../types/error";
import { enrichLogContext } from "../utils/contextEnrichment";

const HEADER_RE = /^\[(.*?)\]\s+(\w+)(?:\.(\w+))?:\s+(.*)$/;

export function parseLaravelLog(content: string): LaravelErrorLog[] {
  const lines = content.split(/\r?\n/);
  const entries: LaravelErrorLog[] = [];

  let current: LaravelErrorLog | null = null;

  for (const line of lines) {
    const match = line.match(HEADER_RE);
    if (match) {
      if (current) entries.push(enrichLogContext(current));
      const [, timestamp, environment, level, message] = match;
      current = {
        timestamp,
        environment,
        level: (level ?? "error").toLowerCase(),
        message,
        stack: [],
        raw: line,
      };
      continue;
    }

    if (!current) continue;
    current.stack.push(line);
    current.raw += `\n${line}`;
  }

  if (current) entries.push(enrichLogContext(current));

  return entries;
}
