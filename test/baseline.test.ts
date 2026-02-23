import { describe, expect, test } from "bun:test";
import { checkBaseline, createBaseline } from "../src/baseline";

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
});
