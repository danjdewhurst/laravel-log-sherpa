import { readFileSync } from "node:fs";
import { parseLaravelLog } from "./parsers/laravelParser";
import { summarize } from "./analyze";
import { filterByDateRange } from "./utils/dateFilter";
import { enrichContexts } from "./utils/contextEnrichment";
import { attachFingerprints } from "./utils/fingerprint";

export interface WatchOptions {
  from?: string;
  to?: string;
  intervalMs: number;
}

export function renderWatchFrame(file: string, opts: WatchOptions): string {
  const content = readFileSync(file, "utf8");
  const parsed = parseLaravelLog(content);
  const filtered = filterByDateRange(parsed, opts.from, opts.to);
  const processed = attachFingerprints(enrichContexts(filtered));
  const summary = summarize(processed);

  return [
    "\x1Bc",
    `Laravel Log Sherpa Watch: ${new Date().toISOString()}`,
    "=".repeat(60),
    `Total: ${summary.total}`,
    `Levels: ${Object.entries(summary.byLevel)
      .map(([l, c]) => `${l}:${c}`)
      .join(" | ") || "none"}`,
    "Top fingerprints:",
    ...summary.topFingerprints.slice(0, 5).map((fp) => `- ${fp.fingerprint} (${fp.count})`),
  ].join("\n");
}

export function runWatch(file: string, opts: WatchOptions): void {
  const print = () => process.stdout.write(renderWatchFrame(file, opts) + "\n");
  print();
  const interval = setInterval(print, opts.intervalMs);
  process.on("SIGINT", () => {
    clearInterval(interval);
    process.exit(0);
  });
}
