#!/usr/bin/env bun
import { Command } from "commander";
import { readFileSync } from "node:fs";
import { parseLaravelLog } from "./parsers/laravelParser";
import { summarize } from "./analyze";
import { TableFormatter } from "./formatters/tableFormatter";
import { PluginManager } from "./plugins/pluginManager";
import { noiseSuppressionPlugin } from "./plugins/noiseSuppressionPlugin";
import { filterByDateRange } from "./utils/dateFilter";
import { runTui } from "./tui";

const program = new Command();

program
  .name("log-sherpa")
  .description("Parse and summarize Laravel error logs with extensible plugin support")
  .version("0.2.0")
  .argument("<file>", "Path to laravel.log")
  .option("--json", "Output JSON")
  .option("--from <isoDate>", "Include logs from this date/time (ISO-8601)")
  .option("--to <isoDate>", "Include logs up to this date/time (ISO-8601)")
  .option("--suppress-noise", "Apply built-in noise suppression plugin")
  .option("--tui", "Interactive terminal view")
  .action(async (file, options) => {
    const content = readFileSync(file, "utf8");
    const parsed = parseLaravelLog(content);

    let processed = filterByDateRange(parsed, options.from, options.to);

    const plugins = new PluginManager();
    if (options.suppressNoise) {
      plugins.register(noiseSuppressionPlugin());
    }
    processed = plugins.runTransform(processed);

    const summary = summarize(processed);

    if (options.tui) {
      await runTui(processed, summary);
      return;
    }

    if (options.json) {
      console.log(JSON.stringify({ logs: processed, summary }, null, 2));
      return;
    }

    const formatter = new TableFormatter();
    console.log(formatter.format(processed, summary));
  });

await program.parseAsync();
