import type { LaravelErrorLog } from "../types/error";

function normalizeMessage(message: string): string {
  return message
    .replace(/[0-9a-f]{8,}/gi, "<hex>")
    .replace(/\b\d+\b/g, "<num>")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function topFrame(stack: string[]): string {
  const candidate = stack.find((line) => line.trim().startsWith("#")) ?? stack[0] ?? "";
  return candidate
    .replace(/\(\d+\)/g, "(<line>)")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function computeFingerprint(log: LaravelErrorLog): string {
  const base = `${log.level}|${normalizeMessage(log.message)}|${topFrame(log.stack)}`;
  let hash = 2166136261;
  for (let i = 0; i < base.length; i++) {
    hash ^= base.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return `fp_${(hash >>> 0).toString(16)}`;
}

export function attachFingerprints(logs: LaravelErrorLog[]): LaravelErrorLog[] {
  return logs.map((log) => ({ ...log, fingerprint: log.fingerprint ?? computeFingerprint(log) }));
}
