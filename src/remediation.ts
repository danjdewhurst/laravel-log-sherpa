import type { LaravelErrorLog } from "./types/error";

export interface RemediationRule {
  pattern: string;
  hint: string;
}

export interface RemediationHint {
  hint: string;
  matches: number;
  pattern: string;
}

const DEFAULT_RULES: RemediationRule[] = [
  { pattern: "SQLSTATE|database|deadlock", hint: "Check DB connectivity, indexes, and retry/deadlock strategy." },
  { pattern: "queue|horizon|worker", hint: "Inspect queue worker health, concurrency, and failed_jobs backlog." },
  { pattern: "cache|redis|memcached", hint: "Validate cache backend availability and key TTL/serialization settings." },
  { pattern: "out of memory|Allowed memory size", hint: "Raise PHP worker memory limits and profile memory-heavy jobs." },
  { pattern: "csrf|token mismatch|419", hint: "Check session/cookie domain config and CSRF token propagation." },
];

export function buildRemediationHints(logs: LaravelErrorLog[], customRules: RemediationRule[] = []): RemediationHint[] {
  const rules = [...DEFAULT_RULES, ...customRules];
  const text = logs.map((l) => `${l.message}\n${l.stack.join("\n")}`).join("\n");

  return rules
    .map((rule) => {
      const re = new RegExp(rule.pattern, "ig");
      const matches = text.match(re)?.length ?? 0;
      return { hint: rule.hint, matches, pattern: rule.pattern };
    })
    .filter((h) => h.matches > 0)
    .sort((a, b) => b.matches - a.matches)
    .slice(0, 5);
}
