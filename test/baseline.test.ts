import { describe, expect, test } from "bun:test";
import { checkBaseline, createBaseline, formatBaselineCheckReport } from "../src/baseline";

describe("baseline", () => {
  test("detects new fingerprints against baseline", () => {
    const base = createBaseline([
      { level: "error", timestamp: "t", message: "a", stack: [], raw: "", fingerprint: "fp_a" },
    ]);

    const result = checkBaseline(base, [
      { level: "error", timestamp: "t", message: "a", stack: [], raw: "", fingerprint: "fp_a" },
      { level: "error", timestamp: "t", message: "b", stack: [], raw: "", fingerprint: "fp_b" },
    ]);

    expect(result.newFingerprints).toHaveLength(1);
    expect(result.newFingerprints[0].fingerprint).toBe("fp_b");
  });

  test("formats human-readable report", () => {
    const report = formatBaselineCheckReport(
      {
        newFingerprints: [
          { fingerprint: "fp_new_1", count: 4 },
          { fingerprint: "fp_new_2", count: 2 },
        ],
        resolvedFingerprints: [{ fingerprint: "fp_old_1", count: 3 }],
      },
      1,
    );

    expect(report).toContain("Baseline check");
    expect(report).toContain("New fingerprints: 2");
    expect(report).toContain("+ fp_new_1 (4)");
    expect(report).not.toContain("fp_new_2");
    expect(report).toContain("Resolved fingerprints: 1");
    expect(report).toContain("- fp_old_1 (3)");
  });
});
