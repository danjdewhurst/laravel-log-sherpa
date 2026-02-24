import { describe, expect, test } from "bun:test";
import { splitCsv } from "../src/utils/csvList";

describe("splitCsv", () => {
  test("supports repeatable flags and csv values", () => {
    expect(splitCsv(["error,warning", "info"])).toEqual(["error", "warning", "info"]);
  });

  test("drops blank entries", () => {
    expect(splitCsv(["error, ,warning", ""])).toEqual(["error", "warning"]);
  });
});
