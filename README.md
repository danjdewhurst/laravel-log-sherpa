# Laravel Log Sherpa

[![CI](https://github.com/danjdewhurst/laravel-log-sherpa/actions/workflows/ci.yml/badge.svg)](https://github.com/danjdewhurst/laravel-log-sherpa/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/tag/danjdewhurst/laravel-log-sherpa?label=release)](https://github.com/danjdewhurst/laravel-log-sherpa/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

A fast, extensible CLI for parsing and summarizing Laravel error logs using **TypeScript + Bun**.

## Features

- Parse standard Laravel log format (`[timestamp] env.LEVEL: message`)
- Human-friendly summary output
- `--json` output for scripting and pipelines
- **Date-range filtering** (`--from`, `--to`)
- **Built-in noise suppression** (`--suppress-noise`)
- **Interactive TUI mode** (`--tui`)
- Plugin architecture for transforms/parsers
- Strict TypeScript types throughout
- CI + release workflow

## Quickstart

```bash
git clone https://github.com/danjdewhurst/laravel-log-sherpa.git
cd laravel-log-sherpa
bun install
```

Run:

```bash
bun run src/index.ts /path/to/storage/logs/laravel.log
bun run src/index.ts /path/to/storage/logs/laravel.log --json
bun run src/index.ts /path/to/storage/logs/laravel.log --from 2026-02-23T00:00:00Z --to 2026-02-23T23:59:59Z
bun run src/index.ts /path/to/storage/logs/laravel.log --suppress-noise
bun run src/index.ts /path/to/storage/logs/laravel.log --tui
```

## Roadmap

- [x] Add date-range filtering
- [x] Built-in noise suppression plugin
- [x] TUI mode for interactive triage

## Testing

```bash
bunx tsc --noEmit
bun test --coverage
```

## License

MIT
