import { describe, expect, test } from "bun:test";
import { compareLogs } from "../src/compare";

describe("compareLogs", () => {
  test("detects new and resolved fingerprints", () => {
    const oldLogs = [
      { level: "error", timestamp: "t", message: "A", stack: [], raw: "", fingerprint: "fp_a" },
      { level: "error", timestamp: "t", message: "B", stack: [], raw: "", fingerprint: "fp_b" },
    ];
    const newLogs = [
      { level: "error", timestamp: "t", message: "B", stack: [], raw: "", fingerprint: "fp_b" },
      { level: "error", timestamp: "t", message: "C", stack: [], raw: "", fingerprint: "fp_c" },
    ];

    const result = compareLogs(oldLogs, newLogs);
    expect(result.newErrors.map((l) => l.fingerprint)).toEqual(["fp_c"]);
    expect(result.resolvedErrors.map((l) => l.fingerprint)).toEqual(["fp_a"]);
    expect(result.unchanged.map((l) => l.fingerprint)).toEqual(["fp_b"]);
  });
});
