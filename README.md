# Laravel Log Sherpa

[![CI](https://github.com/danjdewhurst/laravel-log-sherpa/actions/workflows/ci.yml/badge.svg)](https://github.com/danjdewhurst/laravel-log-sherpa/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/tag/danjdewhurst/laravel-log-sherpa?label=release)](https://github.com/danjdewhurst/laravel-log-sherpa/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

A fast, extensible CLI for parsing and summarizing Laravel error logs using **TypeScript + Bun**.

## Features

- Parse standard Laravel log format (`[timestamp] env.LEVEL: message`)
- Human-friendly summary output + `--json`
- `--format table|markdown|html|sarif|slack|discord`
- Date-range filtering (`--from`, `--to`)
- Built-in noise suppression (`--suppress-noise`)
- PII scrubber plugin (`--scrub-pii`)
- Interactive TUI mode (`--tui`)
- Fingerprint grouping for duplicate stack traces
- Compare mode (`--compare old.log new.log`)
- Deploy-aware regression snapshots (`--since-deploy 2026-02-24T10:30:00Z`)
- CI policy gates (`--ci`, `--fail-on-level`, `--fail-on-pattern`) with non-zero exit code
- Context enrichment (route/controller/job/request id extraction)
- Pattern packs (`--pattern-pack database|auth|queue|cache`)
- Watch mode (`--tail`, `--tail-interval`)
- Multi-file incident window mode (`--dir /path/to/logs --match laravel`)
- Baselines (`baseline create`, `baseline check`)
- Config support (`log-sherpa.config.ts|js|json`)
- OpenTelemetry/Sentry export bridge (`--export-otel`, `--export-sentry`)
- Shell completions (`--completion bash|zsh|fish`)

## Quickstart

```bash
git clone https://github.com/danjdewhurst/laravel-log-sherpa.git
cd laravel-log-sherpa
bun install
```

## Usage

```bash
# basic
bun run src/index.ts /path/to/storage/logs/laravel.log

# incident window across rotated logs
bun run src/index.ts --dir /path/to/storage/logs --match laravel

# structured output
bun run src/index.ts /path/to/storage/logs/laravel.log --json
bun run src/index.ts /path/to/storage/logs/laravel.log --format markdown
bun run src/index.ts /path/to/storage/logs/laravel.log --format html
bun run src/index.ts /path/to/storage/logs/laravel.log --format sarif
bun run src/index.ts /path/to/storage/logs/laravel.log --format slack
bun run src/index.ts /path/to/storage/logs/laravel.log --format discord

# filters/plugins
bun run src/index.ts /path/to/storage/logs/laravel.log --from 2026-02-23T00:00:00Z --to 2026-02-23T23:59:59Z
bun run src/index.ts /path/to/storage/logs/laravel.log --suppress-noise --scrub-pii
bun run src/index.ts /path/to/storage/logs/laravel.log --pattern-pack database --pattern-pack queue

# compare + watch
bun run src/index.ts --compare old.log new.log
bun run src/index.ts /path/to/storage/logs/laravel.log --tail --tail-interval 1500

# deploy-aware regression check
bun run src/index.ts /path/to/storage/logs/laravel.log --since-deploy 2026-02-24T10:30:00Z

# CI policy (exit code 2 on violations)
bun run src/index.ts /path/to/storage/logs/laravel.log --ci --fail-on-level error=1 --fail-on-pattern "sqlstate"

# baseline snapshots
bun run src/index.ts baseline create /path/to/storage/logs/laravel.log --out .log-sherpa-baseline.json
bun run src/index.ts baseline check /path/to/storage/logs/laravel.log --baseline .log-sherpa-baseline.json

# integrations + UX
bun run src/index.ts /path/to/storage/logs/laravel.log --export-otel otel.json --export-sentry sentry.json
bun run src/index.ts --completion bash
bun run src/index.ts /path/to/storage/logs/laravel.log --tui
```

Example `log-sherpa.config.ts`:

```ts
export default {
  suppressNoise: true,
  scrubPii: true,
  output: "table",
  patternPacks: ["database"],
  ci: {
    failOnLevel: { error: 5 },
    failOnPatterns: ["sqlstate", "out of memory"],
  },
};
```

## Roadmap

- [x] Add date-range filtering
- [x] Built-in noise suppression plugin
- [x] TUI mode for interactive triage
- [x] Smart grouping/fingerprinting for duplicate stack traces
- [x] Diff mode (`--compare old.log new.log`) for new vs resolved errors
- [x] CI policy exit codes (fail on thresholds/patterns)
- [x] Additional output formats (Markdown, HTML, SARIF)
- [x] Laravel context enrichment (route/controller/job/request id)
- [x] Shareable pattern packs for common Laravel issues
- [x] Watch mode (`--tail`) with live rolling summaries
- [x] PII scrubber plugin
- [x] Baseline snapshots (`baseline create/check`) for regression detection
- [x] Config file support (`log-sherpa.config.ts`)
- [x] OpenTelemetry/Sentry export bridge
- [x] CLI UX polish (shell completions, richer errors, fixture packs)
- [x] Multi-file incident window mode (analyze rotated logs as one timeline)
- [x] Deploy-aware regression detection (`--since-deploy`)
- [x] Slack/Discord incident digest output formats
- [ ] Anomaly detection for error-rate spikes in watch mode
- [ ] Auto-remediation hints via configurable playbooks

## Testing

```bash
bunx tsc --noEmit
bun test --coverage
```

## License

MIT
