import { describe, expect, test } from "bun:test";
import { filterByLevels } from "../src/utils/levelFilter";
import type { LaravelErrorLog } from "../src/types/error";

function log(level: string): LaravelErrorLog {
  return {
    level,
    timestamp: "2026-02-24T10:00:00.000000Z",
    message: `${level} message`,
    stack: [],
    raw: level,
  };
}

describe("filterByLevels", () => {
  const logs = [log("ERROR"), log("warning"), log("info")];

  test("includes only requested levels", () => {
    const result = filterByLevels(logs, ["error", "warning"], []);
    expect(result.map((l) => l.level)).toEqual(["ERROR", "warning"]);
  });

  test("excludes requested levels", () => {
    const result = filterByLevels(logs, [], ["warning"]);
    expect(result.map((l) => l.level)).toEqual(["ERROR", "info"]);
  });

  test("exclusion wins when level is both included and excluded", () => {
    const result = filterByLevels(logs, ["error", "warning"], ["error"]);
    expect(result.map((l) => l.level)).toEqual(["warning"]);
  });
});
