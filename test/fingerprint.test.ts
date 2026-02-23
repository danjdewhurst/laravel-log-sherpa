import { describe, expect, test } from "bun:test";
import { attachFingerprints, computeFingerprint } from "../src/utils/fingerprint";

describe("fingerprint", () => {
  test("stable fingerprint for similar dynamic values", () => {
    const a = computeFingerprint({
      level: "error",
      timestamp: "t",
      message: "Order 123 failed with id abcd1234",
      stack: ["#0 /app/Foo.php(12): run()"],
      raw: "",
    });
    const b = computeFingerprint({
      level: "error",
      timestamp: "t",
      message: "Order 999 failed with id ffff9999",
      stack: ["#0 /app/Foo.php(98): run()"],
      raw: "",
    });

    expect(a).toBe(b);
    expect(attachFingerprints([{ level: "error", timestamp: "t", message: "x", stack: [], raw: "" }])[0].fingerprint).toBeDefined();
  });
});
