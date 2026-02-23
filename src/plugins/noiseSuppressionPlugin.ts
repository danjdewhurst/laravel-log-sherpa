import type { LaravelErrorLog, LogPlugin } from "../types/error";

const DEFAULT_NOISE_PATTERNS: RegExp[] = [
  /health\s*check/i,
  /csrf token mismatch/i,
  /debugbar/i,
  /deprecation warning/i,
  /ignition/i,
];

function isNoise(log: LaravelErrorLog, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(log.message) || log.stack.some((s) => pattern.test(s)));
}

export function noiseSuppressionPlugin(patterns = DEFAULT_NOISE_PATTERNS): LogPlugin {
  return {
    name: "noise-suppression",
    transform(logs) {
      return logs.filter((log) => !isNoise(log, patterns));
    },
  };
}

export { DEFAULT_NOISE_PATTERNS };
