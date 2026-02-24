import { afterEach, describe, expect, test } from "bun:test";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { parseLogDirectory } from "../src/logSources";

const tempDirs: string[] = [];

function makeTempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "log-sherpa-dir-test-"));
  tempDirs.push(dir);
  return dir;
}

function writeLog(path: string, message: string): void {
  writeFileSync(path, `[2026-02-24 10:00:00] local.ERROR: ${message}\n`, "utf8");
}

afterEach(() => {
  for (const dir of tempDirs.splice(0, tempDirs.length)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe("parseLogDirectory", () => {
  test("parses matching files in sorted order and ignores directories", () => {
    const dir = makeTempDir();
    writeLog(join(dir, "laravel-2.log"), "second message");
    writeLog(join(dir, "laravel-1.log"), "first message");
    writeLog(join(dir, "app.log"), "should be ignored");
    mkdirSync(join(dir, "laravel-archive"));
    writeLog(join(dir, "laravel-archive", "laravel-3.log"), "nested should be ignored");

    const logs = parseLogDirectory(dir, "laravel");
    expect(logs.map((l) => l.message)).toEqual(["first message", "second message"]);
  });

  test("supports custom filename match filter", () => {
    const dir = makeTempDir();
    writeLog(join(dir, "incident-001.log"), "incident message");
    writeLog(join(dir, "laravel.log"), "non-incident message");

    const logs = parseLogDirectory(dir, "incident");
    expect(logs).toHaveLength(1);
    expect(logs[0].message).toBe("incident message");
  });
});
