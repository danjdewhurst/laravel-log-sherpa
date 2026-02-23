import { describe, expect, test } from "bun:test";
import { getCompletion } from "../src/completions";

describe("completions", () => {
  test("returns completion script", () => {
    expect(getCompletion("bash")).toContain("complete -F _log_sherpa_completions");
    expect(getCompletion("zsh")).toContain("#compdef log-sherpa");
    expect(getCompletion("fish")).toContain("complete -c log-sherpa");
  });
});
