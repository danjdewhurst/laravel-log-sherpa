import { describe, expect, test } from "bun:test";
import { formatDiscordDigest, formatSlackDigest } from "../src/formatters/chatDigestFormatter";

const summary = {
  total: 7,
  byLevel: { error: 5, warning: 2 },
  topMessages: [
    { message: "Database timeout", count: 3 },
    { message: "Queue worker died", count: 2 },
    { message: "Cache miss storm", count: 1 },
    { message: "Should be truncated", count: 1 },
  ],
  topFingerprints: [],
  patternHits: {},
};

describe("chat digest formatters", () => {
  test("formats Slack digest with bold header and top-three messages", () => {
    const out = formatSlackDigest([], summary);

    expect(out).toContain("*Laravel Log Sherpa Incident Digest*");
    expect(out).toContain("• Total: *7*");
    expect(out).toContain("• Levels: error:5 | warning:2");
    expect(out).toContain("  - 3× Database timeout");
    expect(out).toContain("  - 1× Cache miss storm");
    expect(out).not.toContain("Should be truncated");
  });

  test("formats Discord digest with markdown styling and top-three messages", () => {
    const out = formatDiscordDigest([], summary);

    expect(out).toContain("**Laravel Log Sherpa Incident Digest**");
    expect(out).toContain("- Total: **7**");
    expect(out).toContain("- Levels: error:5 | warning:2");
    expect(out).toContain("  - 2× Queue worker died");
    expect(out).not.toContain("Should be truncated");
  });
});
