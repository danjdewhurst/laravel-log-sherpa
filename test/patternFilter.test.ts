import { describe, expect, test } from "bun:test";
import { filterByPattern } from "../src/utils/patternFilter";

const logs = [
  { level: "error", timestamp: "t1", message: "Database timeout", stack: ["SQLSTATE"], raw: "" },
  { level: "warning", timestamp: "t2", message: "Redis reconnect", stack: ["Connection reset"], raw: "" },
];

describe("filterByPattern", () => {
  test("filters by message and stack regex", () => {
    expect(filterByPattern(logs, "database")).toHaveLength(1);
    expect(filterByPattern(logs, "connection")).toHaveLength(1);
    expect(filterByPattern(logs, "missing")).toHaveLength(0);
  });

  test("throws for invalid regex", () => {
    expect(() => filterByPattern(logs, "(")).toThrow("Invalid regex");
  });
});
