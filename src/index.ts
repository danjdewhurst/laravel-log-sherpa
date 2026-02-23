#!/usr/bin/env bun
import { Command } from "commander";
import { readFileSync } from "node:fs";
import { parseLaravelLog } from "./parsers/laravelParser";
import { summarize } from "./analyze";
import { TableFormatter } from "./formatters/tableFormatter";
import { PluginManager } from "./plugins/pluginManager";

const program = new Command();

program
  .name("log-sherpa")
  .description("Parse and summarize Laravel error logs with extensible plugin support")
  .version("0.1.0")
  .argument("<file>", "Path to laravel.log")
  .option("--json", "Output JSON")
  .action((file, options) => {
    const content = readFileSync(file, "utf8");
    const parsed = parseLaravelLog(content);

    const plugins = new PluginManager();
    const transformed = plugins.runTransform(parsed);

    const summary = summarize(transformed);

    if (options.json) {
      console.log(JSON.stringify({ logs: transformed, summary }, null, 2));
      return;
    }

    const formatter = new TableFormatter();
    console.log(formatter.format(transformed, summary));
  });

program.parse();
