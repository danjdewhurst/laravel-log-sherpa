import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { parseLaravelLog } from "../src/parsers/laravelParser";

describe("fixture pack", () => {
  test("parses bundled common laravel error fixture", () => {
    const content = readFileSync("test/fixtures/common-laravel-errors.log", "utf8");
    const logs = parseLaravelLog(content);
    expect(logs).toHaveLength(2);
    expect(logs[0].context?.controller).toBe("OrderController@index");
  });
});
