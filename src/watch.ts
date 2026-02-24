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
  anomalyFactor?: number;
  anomalyMinDelta?: number;
  history?: number[];
}

export function renderWatchFrame(file: string, opts: WatchOptions): string {
  const content = readFileSync(file, "utf8");
  const parsed = parseLaravelLog(content);
  const filtered = filterByDateRange(parsed, opts.from, opts.to);
  const processed = attachFingerprints(enrichContexts(filtered));
  const summary = summarize(processed);
  const history = opts.history ?? [];
  const previous = history[history.length - 1];
  const baseline = history.length > 0 ? history.reduce((sum, n) => sum + n, 0) / history.length : undefined;
  const delta = previous === undefined ? 0 : summary.total - previous;
  const anomalyFactor = opts.anomalyFactor ?? 2;
  const anomalyMinDelta = opts.anomalyMinDelta ?? 5;
  const isAnomaly =
    baseline !== undefined &&
    baseline > 0 &&
    summary.total >= baseline * anomalyFactor &&
    delta >= anomalyMinDelta;

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
    isAnomaly ? `⚠️  Anomaly: error volume spike detected (baseline ${baseline?.toFixed(1)} -> ${summary.total})` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function runWatch(file: string, opts: WatchOptions): void {
  const history: number[] = [];
  const print = () => {
    process.stdout.write(renderWatchFrame(file, { ...opts, history }) + "\n");
    const content = readFileSync(file, "utf8");
    const total = summarize(attachFingerprints(enrichContexts(parseLaravelLog(content)))).total;
    history.push(total);
    if (history.length > 10) history.shift();
  };
  print();
  const interval = setInterval(print, opts.intervalMs);
  process.on("SIGINT", () => {
    clearInterval(interval);
    process.exit(0);
  });
}
