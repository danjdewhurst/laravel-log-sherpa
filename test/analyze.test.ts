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
          context: { route: "/orders", controller: "OrderController@index", requestId: "req-1" },
        },
        {
          level: "error",
          timestamp: "t2",
          message: "DB failed",
          stack: [],
          raw: "",
          context: { route: "/orders", controller: "OrderController@index", requestId: "req-2" },
        },
        {
          level: "warning",
          timestamp: "t3",
          message: "Slow query",
          stack: [],
          raw: "",
          context: { route: "/checkout", job: "SyncOrderJob", requestId: "req-1" },
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
    expect(summary.contextHotspots?.routes[0]).toEqual({ key: "/orders", count: 2 });
    expect(summary.contextHotspots?.controllers[0]).toEqual({ key: "OrderController@index", count: 2 });
    expect(summary.contextHotspots?.requestIds[0]).toEqual({ key: "req-1", count: 2 });
    expect(summary.contextHotspots?.jobs[0]).toEqual({ key: "SyncOrderJob", count: 1 });
  });

  test("supports configurable summary limits", () => {
    const logs = attachFingerprints([
      { level: "error", timestamp: "t1", message: "A", stack: [], raw: "", context: { route: "/a" } },
      { level: "error", timestamp: "t2", message: "A", stack: [], raw: "", context: { route: "/a" } },
      { level: "error", timestamp: "t3", message: "B", stack: [], raw: "", context: { route: "/b" } },
      { level: "error", timestamp: "t4", message: "C", stack: [], raw: "", context: { route: "/c" } },
    ]);

    const summary = summarize(logs, [], { topMessages: 2, topFingerprints: 1, topContextValues: 2 });

    expect(summary.topMessages.map((m) => m.message)).toEqual(["A", "B"]);
    expect(summary.topFingerprints).toHaveLength(1);
    expect(summary.contextHotspots?.routes).toHaveLength(2);
  });
});
