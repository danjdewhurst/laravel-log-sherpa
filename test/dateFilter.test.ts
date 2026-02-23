import { describe, expect, test } from "bun:test";
import { filterByDateRange } from "../src/utils/dateFilter";

const logs = [
  { level: "error", timestamp: "2026-02-23 09:00:00", message: "a", stack: [], raw: "" },
  { level: "error", timestamp: "2026-02-23 10:00:00", message: "b", stack: [], raw: "" },
  { level: "error", timestamp: "2026-02-23 11:00:00", message: "c", stack: [], raw: "" },
];

describe("filterByDateRange", () => {
  test("filters by from/to", () => {
    const result = filterByDateRange(logs, "2026-02-23T09:30:00Z", "2026-02-23T10:30:00Z");
    expect(result).toHaveLength(1);
    expect(result[0].message).toBe("b");
  });

  test("throws for invalid date", () => {
    expect(() => filterByDateRange(logs, "not-a-date", undefined)).toThrow();
  });
});
