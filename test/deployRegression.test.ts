import { describe, expect, test } from "bun:test";
import { computeDeployRegression } from "../src/deployRegression";

describe("computeDeployRegression", () => {
  test("detects fingerprints introduced after deploy time", () => {
    const result = computeDeployRegression(
      [
        { level: "error", timestamp: "2026-02-24 09:00:00", message: "A", stack: [], raw: "", fingerprint: "fp_a" },
        { level: "error", timestamp: "2026-02-24 10:00:00", message: "A", stack: [], raw: "", fingerprint: "fp_a" },
        { level: "error", timestamp: "2026-02-24 10:15:00", message: "B", stack: [], raw: "", fingerprint: "fp_b" },
        { level: "error", timestamp: "2026-02-24 10:20:00", message: "B", stack: [], raw: "", fingerprint: "fp_b" },
        { level: "error", timestamp: "2026-02-24 10:30:00", message: "C", stack: [], raw: "", fingerprint: "fp_c" },
      ],
      "2026-02-24T10:00:00Z",
    );

    expect(result.beforeCount).toBe(1);
    expect(result.afterCount).toBe(4);
    expect(result.newFingerprints).toEqual([
      { fingerprint: "fp_b", count: 2 },
      { fingerprint: "fp_c", count: 1 },
    ]);
  });

  test("throws on invalid deploy date", () => {
    expect(() => computeDeployRegression([], "nope")).toThrow("Invalid --since-deploy date: nope");
  });
});
