import { describe, expect, test } from "bun:test";
import { PluginManager } from "../src/plugins/pluginManager";

describe("PluginManager", () => {
  test("applies transforms in order", () => {
    const mgr = new PluginManager();
    mgr.register({
      name: "mark",
      transform(logs) {
        return logs.map((l) => ({ ...l, message: `${l.message}!` }));
      },
    });

    const result = mgr.runTransform([
      { level: "error", timestamp: "t", message: "oops", stack: [], raw: "" },
    ]);

    expect(result[0].message).toBe("oops!");
  });

  test("ignores plugins without transform", () => {
    const mgr = new PluginManager();
    mgr.register({ name: "noop" });

    const input = [
      { level: "error", timestamp: "t", message: "oops", stack: [], raw: "" },
    ];

    const result = mgr.runTransform(input);
    expect(result).toEqual(input);
  });
});
