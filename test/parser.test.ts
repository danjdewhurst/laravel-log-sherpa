import { describe, expect, test } from "bun:test";
import { parseLaravelLog } from "../src/parsers/laravelParser";

describe("parseLaravelLog", () => {
  test("parses single log entry", () => {
    const content = `[2026-02-23 09:00:00] local.ERROR: Boom\n#0 /app/file.php(1): fail()`;
    const logs = parseLaravelLog(content);
    expect(logs).toHaveLength(1);
    expect(logs[0].level).toBe("error");
    expect(logs[0].message).toBe("Boom");
    expect(logs[0].stack).toHaveLength(1);
  });

  test("parses multiple entries and enriches context", () => {
    const content = [
      `[2026-02-23 09:00:00] local.ERROR: Boom route=/users controller=UserController@index request_id=req-123`,
      `#0 first`,
      `[2026-02-23 10:00:00] production.WARNING: Heads up`,
      `#0 second`,
    ].join("\n");

    const logs = parseLaravelLog(content);
    expect(logs).toHaveLength(2);
    expect(logs[1].level).toBe("warning");
    expect(logs[1].environment).toBe("production");
    expect(logs[0].context?.route).toBe("/users");
    expect(logs[0].context?.controller).toBe("UserController@index");
    expect(logs[0].context?.requestId).toBe("req-123");
  });
});
