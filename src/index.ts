#!/usr/bin/env bun
import { Command } from "commander";
import { summarize } from "./analyze";
import { createBaseline, checkBaseline, formatBaselineCheckReport, loadBaseline, saveBaseline } from "./baseline";
import { evaluateCiPolicy, parseLevelThresholds } from "./ciPolicy";
import { compareLogs } from "./compare";
import { getCompletion } from "./completions";
import { loadConfig } from "./config";
import { exportOtel, exportSentry } from "./exporters";
import { computeDeployRegression } from "./deployRegression";
import { HtmlFormatter } from "./formatters/htmlFormatter";
import { MarkdownFormatter } from "./formatters/markdownFormatter";
import { formatSarif } from "./formatters/sarifFormatter";
import { TableFormatter } from "./formatters/tableFormatter";
import { formatDiscordDigest, formatSlackDigest } from "./formatters/chatDigestFormatter";
import { parseLogDirectory, parseLogFile } from "./logSources";
import { noiseSuppressionPlugin } from "./plugins/noiseSuppressionPlugin";
import { piiScrubberPlugin } from "./plugins/piiScrubberPlugin";
import { PluginManager } from "./plugins/pluginManager";
import { runTui } from "./tui";
import type { LaravelErrorLog } from "./types/error";
import { filterByDateRange } from "./utils/dateFilter";
import { attachFingerprints } from "./utils/fingerprint";
import { resolvePatternPacks } from "./patternPacks";
import { runWatch } from "./watch";
import { buildRemediationHints } from "./remediation";
import { filterByLevels } from "./utils/levelFilter";
import { splitCsv } from "./utils/csvList";

interface AnalyzeOptions {
  json?: boolean;
  format?: "table" | "json" | "markdown" | "html" | "sarif" | "slack" | "discord";
  from?: string;
  to?: string;
  suppressNoise?: boolean;
  scrubPii?: boolean;
  tui?: boolean;
  compare?: string[];
  ci?: boolean;
  failOnLevel?: string[];
  failOnPattern?: string[];
  tail?: boolean;
  tailInterval?: string;
  patternPack?: string[];
  config?: string;
  exportOtel?: string;
  exportSentry?: string;
  completion?: string;
  dir?: string;
  match?: string;
  sinceDeploy?: string;
  anomalyFactor?: string;
  anomalyMinDelta?: string;
  includeLevel?: string[];
  excludeLevel?: string[];
  topMessages?: string;
  topFingerprints?: string;
  topContextValues?: string;
  digestTop?: string;
  digestNoFingerprints?: boolean;
}

function collect(value: string, previous: string[]): string[] {
  return previous.concat([value]);
}

function readLimit(raw: string | number | undefined, fallback: number): number {
  if (raw === undefined) return fallback;
  const parsed = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Expected a positive number, got: ${raw}`);
  }
  return Math.floor(parsed);
}

function parseAndProcessLogs(
  parsed: LaravelErrorLog[],
  options: AnalyzeOptions,
  config: Awaited<ReturnType<typeof loadConfig>>,
): { logs: LaravelErrorLog[]; summary: ReturnType<typeof summarize> } {
  let processed = filterByDateRange(parsed, options.from ?? config.from, options.to ?? config.to);

  const plugins = new PluginManager();
  if (options.suppressNoise || config.suppressNoise) {
    plugins.register(noiseSuppressionPlugin());
  }
  if (options.scrubPii || config.scrubPii) {
    plugins.register(piiScrubberPlugin());
  }
  processed = plugins.runTransform(processed);

  const includeLevels = splitCsv([...(config.includeLevels ?? []), ...(options.includeLevel ?? [])]);
  const excludeLevels = splitCsv([...(config.excludeLevels ?? []), ...(options.excludeLevel ?? [])]);
  processed = filterByLevels(processed, includeLevels, excludeLevels);

  processed = attachFingerprints(processed);

  const patternNames = [...(config.patternPacks ?? []), ...(options.patternPack ?? [])];
  const patterns = resolvePatternPacks(patternNames);

  return {
    logs: processed,
    summary: summarize(processed, patterns, {
      topMessages: readLimit(options.topMessages ?? config.summary?.topMessages, 5),
      topFingerprints: readLimit(options.topFingerprints ?? config.summary?.topFingerprints, 10),
      topContextValues: readLimit(options.topContextValues ?? config.summary?.topContextValues, 5),
    }),
  };
}

async function outputResult(
  logs: LaravelErrorLog[],
  summary: ReturnType<typeof summarize>,
  options: AnalyzeOptions,
  config: Awaited<ReturnType<typeof loadConfig>>,
): Promise<void> {
  const deployRegression = options.sinceDeploy
    ? computeDeployRegression(logs, options.sinceDeploy)
    : undefined;
  const remediationHints = buildRemediationHints(logs, config.remediation?.playbook ?? []);
  if (options.tui) {
    await runTui(logs, summary);
    return;
  }

  const format = (options.json ? "json" : options.format ?? config.output ?? "table") as string;
  if (format === "json") {
    console.log(JSON.stringify({ logs, summary, deployRegression, remediationHints }, null, 2));
    return;
  }
  if (format === "markdown") {
    console.log(new MarkdownFormatter().format(logs, summary));
    return;
  }
  if (format === "html") {
    console.log(new HtmlFormatter().format(logs, summary));
    return;
  }
  if (format === "sarif") {
    console.log(formatSarif(logs, summary));
    return;
  }
  if (format === "slack") {
    console.log(
      formatSlackDigest(logs, summary, {
        top: readLimit(options.digestTop ?? config.digest?.top, 3),
        includeFingerprints: options.digestNoFingerprints ? false : (config.digest?.includeFingerprints ?? true),
      }),
    );
    return;
  }
  if (format === "discord") {
    console.log(
      formatDiscordDigest(logs, summary, {
        top: readLimit(options.digestTop ?? config.digest?.top, 3),
        includeFingerprints: options.digestNoFingerprints ? false : (config.digest?.includeFingerprints ?? true),
      }),
    );
    return;
  }
  const baseOutput = new TableFormatter().format(logs, summary);
  const remediationLines = [
    "",
    "Remediation hints",
    "-".repeat(40),
    ...(remediationHints.length > 0
      ? remediationHints.map((hint) => `- ${hint.hint} [matches: ${hint.matches}]`)
      : ["- No matched playbook hints"]),
  ];

  if (!deployRegression) {
    console.log([baseOutput, ...remediationLines].join("\n"));
    return;
  }

  const regressionLines = [
    "",
    `Deploy regression (${deployRegression.sinceDeploy})`,
    "-".repeat(40),
    `Before deploy logs: ${deployRegression.beforeCount}`,
    `After deploy logs:  ${deployRegression.afterCount}`,
    `New fingerprints:  ${deployRegression.newFingerprints.length}`,
    ...deployRegression.newFingerprints.map((fp) => `- ${fp.fingerprint} (${fp.count})`),
  ];
  console.log([baseOutput, ...regressionLines, ...remediationLines].join("\n"));
}

const program = new Command();
program
  .name("log-sherpa")
  .description("Parse and summarize Laravel error logs with extensible plugin support")
  .version("0.3.0")
  .showSuggestionAfterError()
  .showHelpAfterError("\nUse --help to see valid flags and examples.");

program
  .argument("[file]", "Path to laravel.log")
  .option("--json", "Output JSON")
  .option("--format <format>", "Output format: table|json|markdown|html|sarif|slack|discord")
  .option("--from <isoDate>", "Include logs from this date/time (ISO-8601)")
  .option("--to <isoDate>", "Include logs up to this date/time (ISO-8601)")
  .option("--include-level <level>", "Only include these levels (repeatable or CSV)", collect, [])
  .option("--exclude-level <level>", "Exclude these levels (repeatable or CSV)", collect, [])
  .option("--top-messages <n>", "Limit number of top messages shown in summaries")
  .option("--top-fingerprints <n>", "Limit number of top fingerprints shown in summaries")
  .option("--top-context-values <n>", "Limit context hotspot values per category")
  .option("--digest-top <n>", "Top message/fingerprint entries in Slack/Discord digest output")
  .option("--digest-no-fingerprints", "Hide fingerprint section in Slack/Discord digest output")
  .option("--suppress-noise", "Apply built-in noise suppression plugin")
  .option("--scrub-pii", "Apply PII scrubber plugin")
  .option("--tui", "Interactive terminal view")
  .option("--compare <files...>", "Compare two logs: --compare old.log new.log")
  .option("--ci", "Apply CI fail policy and exit non-zero on violations")
  .option("--fail-on-level <level=count>", "CI threshold (repeatable)", collect, [])
  .option("--fail-on-pattern <regex>", "CI regex gate (repeatable)", collect, [])
  .option("--tail", "Watch mode with rolling summaries")
  .option("--tail-interval <ms>", "Watch mode refresh interval in ms", "2000")
  .option("--anomaly-factor <n>", "Spike multiplier for watch-mode anomaly detection", "2")
  .option("--anomaly-min-delta <n>", "Minimum total-count jump before anomaly warning", "5")
  .option("--pattern-pack <name>", "Pattern packs (database|auth|queue|cache)", collect, [])
  .option("--config <path>", "Path to log-sherpa config file")
  .option("--completion <shell>", "Print completion script for bash|zsh|fish")
  .option("--export-otel <file>", "Write OTel-compatible JSON payload")
  .option("--export-sentry <file>", "Write Sentry-compatible JSON payload")
  .option("--dir <path>", "Analyze all log files in a directory")
  .option("--match <substring>", "Filename match filter for --dir mode", "laravel")
  .option("--since-deploy <isoDate>", "Highlight fingerprints that appeared after deploy time")
  .action(async (file, options: AnalyzeOptions) => {
    try {
      if (options.completion) {
        console.log(getCompletion(options.completion));
        return;
      }

      const config = await loadConfig(options.config);

      if (options.compare) {
        if (options.compare.length !== 2) {
          throw new Error("--compare expects exactly two files: --compare old.log new.log");
        }
        const oldData = parseAndProcessLogs(parseLogFile(options.compare[0]), options, config);
        const newData = parseAndProcessLogs(parseLogFile(options.compare[1]), options, config);
        const diff = compareLogs(oldData.logs, newData.logs);
        console.log(
          JSON.stringify(
            {
              summary: {
                new: diff.newErrors.length,
                resolved: diff.resolvedErrors.length,
                unchanged: diff.unchanged.length,
              },
              newErrors: diff.newErrors.slice(0, 20),
              resolvedErrors: diff.resolvedErrors.slice(0, 20),
            },
            null,
            2,
          ),
        );
        return;
      }

      if (!file && !options.dir) {
        throw new Error("A log file path is required unless using --dir, --compare, or --completion.");
      }

      if (options.tail) {
        runWatch(file, {
          from: options.from ?? config.from,
          to: options.to ?? config.to,
          intervalMs: Number(options.tailInterval ?? "2000"),
          anomalyFactor: Number(options.anomalyFactor ?? "2"),
          anomalyMinDelta: Number(options.anomalyMinDelta ?? "5"),
        });
        return;
      }

      const parsed = options.dir ? parseLogDirectory(options.dir, options.match) : parseLogFile(file);
      const { logs, summary } = parseAndProcessLogs(parsed, options, config);

      if (options.exportOtel) exportOtel(logs, options.exportOtel);
      if (options.exportSentry) exportSentry(logs, options.exportSentry);

      if (options.ci) {
        const levels = parseLevelThresholds(options.failOnLevel ?? []);
        const patterns = [...(config.ci?.failOnPatterns ?? []), ...(options.failOnPattern ?? [])].map(
          (p) => new RegExp(p, "i"),
        );
        const result = evaluateCiPolicy(logs, summary, {
          failOnLevel: { ...(config.ci?.failOnLevel ?? {}), ...levels },
          failOnPatterns: patterns,
        });

        if (!result.ok) {
          console.error("CI policy violations:\n- " + result.violations.join("\n- "));
          process.exitCode = result.exitCode;
        }
      }

      await outputResult(logs, summary, options, config);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Error: ${message}`);
      process.exitCode = 1;
    }
  });

const baseline = program.command("baseline").description("Baseline snapshot workflow");

baseline
  .command("create")
  .argument("<file>", "Path to laravel.log")
  .option("--out <path>", "Output baseline file", ".log-sherpa-baseline.json")
  .action(async (file, options) => {
    const config = await loadConfig();
    const { logs } = parseAndProcessLogs(parseLogFile(file), {}, config);
    const snapshot = createBaseline(logs);
    saveBaseline(snapshot, options.out);
    console.log(`Baseline saved to ${options.out} (${snapshot.total} logs)`);
  });

baseline
  .command("check")
  .argument("<file>", "Path to laravel.log")
  .option("--baseline <path>", "Baseline file", ".log-sherpa-baseline.json")
  .option("--format <format>", "Output format: json|table", "json")
  .option("--limit <n>", "Max new/resolved fingerprint rows in table output", "20")
  .action(async (file, options) => {
    const config = await loadConfig();
    const { logs } = parseAndProcessLogs(parseLogFile(file), {}, config);
    const existing = await loadBaseline(options.baseline);
    const result = checkBaseline(existing, logs);

    if (options.format === "table") {
      console.log(formatBaselineCheckReport(result, readLimit(options.limit, 20)));
    } else {
      console.log(JSON.stringify(result, null, 2));
    }

    if (result.newFingerprints.length > 0) {
      process.exitCode = 2;
    }
  });

await program.parseAsync();
