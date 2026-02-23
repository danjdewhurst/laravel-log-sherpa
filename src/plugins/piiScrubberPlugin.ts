import type { LaravelErrorLog, LogPlugin } from "../types/error";

const DEFAULT_PII_PATTERNS: Array<{ re: RegExp; replacement: string }> = [
  { re: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, replacement: "[redacted:email]" },
  { re: /\b(?:\d[ -]*?){13,16}\b/g, replacement: "[redacted:card]" },
  { re: /\b(?:\+?1[ -]?)?\(?\d{3}\)?[ -]?\d{3}[ -]?\d{4}\b/g, replacement: "[redacted:phone]" },
  { re: /\b\d{1,3}(?:\.\d{1,3}){3}\b/g, replacement: "[redacted:ip]" },
];

function scrubText(input: string): string {
  return DEFAULT_PII_PATTERNS.reduce((acc, { re, replacement }) => acc.replace(re, replacement), input);
}

export function piiScrubberPlugin(): LogPlugin {
  return {
    name: "pii-scrubber",
    transform(logs: LaravelErrorLog[]) {
      return logs.map((log) => ({
        ...log,
        message: scrubText(log.message),
        stack: log.stack.map(scrubText),
        raw: scrubText(log.raw),
      }));
    },
  };
}
