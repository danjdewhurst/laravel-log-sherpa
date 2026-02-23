import { describe, expect, test } from "bun:test";
import { noiseSuppressionPlugin } from "../src/plugins/noiseSuppressionPlugin";
import { piiScrubberPlugin } from "../src/plugins/piiScrubberPlugin";

describe("plugins", () => {
  test("noise suppression drops noisy entries", () => {
    const plugin = noiseSuppressionPlugin();
    const result = plugin.transform?.([
      { level: "error", timestamp: "t", message: "health check failed", stack: [], raw: "" },
      { level: "error", timestamp: "t", message: "SQLSTATE connection failed", stack: [], raw: "" },
    ]);

    expect(result).toHaveLength(1);
    expect(result?.[0].message).toContain("SQLSTATE");
  });

  test("pii scrubber redacts sensitive strings", () => {
    const plugin = piiScrubberPlugin();
    const result = plugin.transform?.([
      {
        level: "error",
        timestamp: "t",
        message: "user foo@example.com called from 192.168.0.1",
        stack: ["card 4111111111111111"],
        raw: "foo@example.com 192.168.0.1",
      },
    ]);

    expect(result?.[0].message).toContain("[redacted:email]");
    expect(result?.[0].message).toContain("[redacted:ip]");
    expect(result?.[0].stack[0]).toContain("[redacted:card]");
  });
});
