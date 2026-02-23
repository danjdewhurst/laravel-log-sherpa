import { describe, expect, test } from "bun:test";
import { TableFormatter } from "../src/formatters/tableFormatter";

describe("TableFormatter", () => {
  test("formats summary output", () => {
    const formatter = new TableFormatter();
    const out = formatter.format(
      [{ level: "error", timestamp: "t", message: "Boom", stack: [], raw: "" }],
      {
        total: 1,
        byLevel: { error: 1 },
        topMessages: [{ message: "Boom", count: 1 }],
      },
    );

    expect(out).toContain("Total errors: 1");
    expect(out).toContain("error: 1");
    expect(out).toContain("Boom");
  });

  test("handles empty summaries", () => {
    const formatter = new TableFormatter();
    const out = formatter.format([], { total: 0, byLevel: {}, topMessages: [] });

    expect(out).toContain("Total errors: 0");
    expect(out).toContain("Levels: none");
    expect(out).toContain("Top messages:\nnone");
  });
});
