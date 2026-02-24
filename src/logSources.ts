import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { parseLaravelLog } from "./parsers/laravelParser";
import type { LaravelErrorLog } from "./types/error";

export function parseLogFile(file: string): LaravelErrorLog[] {
  const content = readFileSync(file, "utf8");
  return parseLaravelLog(content);
}

export function parseLogDirectory(dir: string, match = "laravel"): LaravelErrorLog[] {
  const files = readdirSync(dir)
    .filter((name) => name.toLowerCase().includes(match.toLowerCase()))
    .map((name) => join(dir, name))
    .filter((fullPath) => statSync(fullPath).isFile())
    .sort();

  return files.flatMap((file) => parseLogFile(file));
}
