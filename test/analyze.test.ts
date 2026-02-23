import { describe, expect, test } from "bun:test";
import { summarize } from "../src/analyze";
import { attachFingerprints } from "../src/utils/fingerprint";

describe("summarize", () => {
  test("builds summary counts", () => {
    const summary = summarize(
      attachFingerprints([
        {
          level: "error",
          timestamp: "t1",
          message: "DB failed",
          stack: [],
          raw: "",
        },
        {
          level: "error",
          timestamp: "t2",
          message: "DB failed",
          stack: [],
          raw: "",
        },
        {
          level: "warning",
          timestamp: "t3",
          message: "Slow query",
          stack: [],
          raw: "",
        },
      ]),
    );

    expect(summary.total).toBe(3);
    expect(summary.byLevel.error).toBe(2);
    expect(summary.byLevel.warning).toBe(1);
    expect(summary.topMessages[0].message).toBe("DB failed");
    expect(summary.topMessages[0].count).toBe(2);
    expect(summary.topFingerprints.length).toBeGreaterThan(0);
    expect(summary.patternHits).toEqual({});
  });
});
