import { describe, expect, test } from "bun:test";
import { noiseSuppressionPlugin } from "../src/plugins/noiseSuppressionPlugin";

describe("noiseSuppressionPlugin", () => {
  test("drops noisy entries", () => {
    const plugin = noiseSuppressionPlugin();
    const result = plugin.transform?.([
      { level: "error", timestamp: "t", message: "health check failed", stack: [], raw: "" },
      { level: "error", timestamp: "t", message: "SQLSTATE connection failed", stack: [], raw: "" },
    ]);

    expect(result).toHaveLength(1);
    expect(result?.[0].message).toContain("SQLSTATE");
  });
});
