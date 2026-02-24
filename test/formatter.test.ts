import { describe, expect, test } from "bun:test";
import { TableFormatter } from "../src/formatters/tableFormatter";
import { MarkdownFormatter } from "../src/formatters/markdownFormatter";
import { HtmlFormatter } from "../src/formatters/htmlFormatter";

const emptyContextHotspots = {
  routes: [],
  controllers: [],
  jobs: [],
  requestIds: [],
};

describe("formatters", () => {
  test("table formatter formats summary output", () => {
    const formatter = new TableFormatter();
    const out = formatter.format(
      [{ level: "error", timestamp: "t", message: "Boom", stack: [], raw: "", fingerprint: "fp_1" }],
      {
        total: 1,
        byLevel: { error: 1 },
        topMessages: [{ message: "Boom", count: 1 }],
        topFingerprints: [{ fingerprint: "fp_1", count: 1 }],
        patternHits: {},
        contextHotspots: emptyContextHotspots,
      },
    );

    expect(out).toContain("Total errors: 1");
    expect(out).toContain("error: 1");
    expect(out).toContain("Top fingerprints:");
  });

  test("markdown and html formatter output", () => {
    const logs = [{ level: "error", timestamp: "t", message: "Boom", stack: [], raw: "" }];
    const summary = {
      total: 1,
      byLevel: { error: 1 },
      topMessages: [{ message: "Boom", count: 1 }],
      topFingerprints: [],
      patternHits: {},
      contextHotspots: emptyContextHotspots,
    };

    expect(new MarkdownFormatter().format(logs, summary)).toContain("# Laravel Log Sherpa Summary");
    expect(new HtmlFormatter().format(logs, summary)).toContain("<!doctype html>");
  });

  test("handles empty summaries", () => {
    const formatter = new TableFormatter();
    const out = formatter.format([], {
      total: 0,
      byLevel: {},
      topMessages: [],
      topFingerprints: [],
      patternHits: {},
      contextHotspots: emptyContextHotspots,
    });

    expect(out).toContain("Total errors: 0");
    expect(out).toContain("Levels: none");
    expect(out).toContain("Top messages:\nnone");
  });
});
