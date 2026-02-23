import { describe, expect, test } from "bun:test";
import { evaluateCiPolicy, parseLevelThresholds } from "../src/ciPolicy";

describe("ciPolicy", () => {
  test("fails when level threshold is hit", () => {
    const logs = [{ level: "error", timestamp: "t", message: "boom", stack: [], raw: "" }];
    const summary = {
      total: 1,
      byLevel: { error: 1 },
      topMessages: [{ message: "boom", count: 1 }],
      topFingerprints: [],
      patternHits: {},
    };

    const result = evaluateCiPolicy(logs, summary, { failOnLevel: { error: 1 } });
    expect(result.ok).toBeFalse();
    expect(result.exitCode).toBe(2);
  });

  test("parses level thresholds", () => {
    expect(parseLevelThresholds(["error=3", "warning=2"])).toEqual({ error: 3, warning: 2 });
  });
});
