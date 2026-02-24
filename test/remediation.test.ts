import { describe, expect, test } from "bun:test";
import { buildRemediationHints } from "../src/remediation";

describe("buildRemediationHints", () => {
  test("returns ranked default and custom playbook hints by match count", () => {
    const logs = [
      {
        level: "error",
        timestamp: "2026-02-24 10:00:00",
        message: "SQLSTATE deadlock in database transaction",
        stack: ["worker queue restart required", "customTag: EXTRA"],
        raw: "",
      },
      {
        level: "error",
        timestamp: "2026-02-24 10:01:00",
        message: "Queue worker failed because Redis cache is unavailable",
        stack: ["customTag: EXTRA"],
        raw: "",
      },
      {
        level: "warning",
        timestamp: "2026-02-24 10:02:00",
        message: "Allowed memory size exhausted",
        stack: [],
        raw: "",
      },
    ];

    const hints = buildRemediationHints(logs, [{ pattern: "customTag", hint: "Run custom playbook" }]);

    expect(hints.length).toBeGreaterThan(0);
    expect(hints[0]).toEqual({
      hint: "Inspect queue worker health, concurrency, and failed_jobs backlog.",
      matches: 4,
      pattern: "queue|horizon|worker",
    });
    expect(hints.find((h) => h.hint === "Run custom playbook")).toEqual({
      hint: "Run custom playbook",
      matches: 2,
      pattern: "customTag",
    });
    expect(hints.some((h) => h.hint.includes("DB connectivity"))).toBe(true);
    expect(hints.some((h) => h.hint.includes("memory limits"))).toBe(true);
  });

  test("returns empty when no rule matches", () => {
    const hints = buildRemediationHints([
      { level: "info", timestamp: "2026-02-24 10:00:00", message: "All good", stack: [], raw: "" },
    ]);

    expect(hints).toEqual([]);
  });
});
