import { afterEach, describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { renderWatchFrame } from "../src/watch";

const tempDirs: string[] = [];

function makeTempFile(content: string): string {
  const dir = mkdtempSync(join(tmpdir(), "log-sherpa-watch-test-"));
  tempDirs.push(dir);
  const file = join(dir, "laravel.log");
  writeFileSync(file, content, "utf8");
  return file;
}

function makeEntries(count: number): string {
  return Array.from({ length: count }, (_, idx) => {
    const sec = String(idx).padStart(2, "0");
    return `[2026-02-24 10:00:${sec}] local.ERROR: Spike ${idx}`;
  }).join("\n");
}

afterEach(() => {
  for (const dir of tempDirs.splice(0, tempDirs.length)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe("renderWatchFrame", () => {
  test("shows anomaly warning when total spikes over baseline and delta threshold", () => {
    const file = makeTempFile(makeEntries(8));
    const out = renderWatchFrame(file, { intervalMs: 1000, history: [2, 2, 2], anomalyFactor: 2, anomalyMinDelta: 5 });

    expect(out).toContain("Total: 8");
    expect(out).toContain("Anomaly: error volume spike detected (baseline 2.0 -> 8)");
  });

  test("does not show anomaly warning when delta is below threshold", () => {
    const file = makeTempFile(makeEntries(8));
    const out = renderWatchFrame(file, { intervalMs: 1000, history: [7, 7, 7], anomalyFactor: 1, anomalyMinDelta: 5 });

    expect(out).toContain("Total: 8");
    expect(out).not.toContain("Anomaly: error volume spike detected");
  });
});
