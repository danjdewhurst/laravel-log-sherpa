# Laravel Log Sherpa

[![CI](https://github.com/danjdewhurst/laravel-log-sherpa/actions/workflows/ci.yml/badge.svg)](https://github.com/danjdewhurst/laravel-log-sherpa/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/tag/danjdewhurst/laravel-log-sherpa?label=release)](https://github.com/danjdewhurst/laravel-log-sherpa/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

A fast, extensible CLI for parsing and summarizing Laravel error logs using **TypeScript + Bun**.

## Why this exists

Laravel logs grow fast and become painful to scan manually under incident pressure. Laravel Log Sherpa gives you immediate signal:

- what failed most
- how often each severity appears
- a machine-readable JSON output for automation

## Features

- Parse standard Laravel log format (`[timestamp] env.LEVEL: message`)
- Human-friendly summary output
- `--json` output for scripting and pipelines
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
```

## Sample output

```text
Laravel Log Sherpa Summary
========================================
Total errors: 12
Levels: error: 8 | warning: 4

Top messages:
1. (4) SQLSTATE[HY000] [2002] Connection refused
2. (2) Route [login] not defined

Recent entries:
- [error] SQLSTATE[HY000] [2002] Connection refused
```

## Extensibility

Plugins implement `LogPlugin` and can transform entries before summary generation.

```ts
import type { LogPlugin } from "./src/types/error";

export const piiRedactionPlugin: LogPlugin = {
  name: "pii-redaction",
  transform(logs) {
    return logs.map((log) => ({
      ...log,
      message: log.message.replace(/\b\S+@\S+\.\S+\b/g, "[REDACTED_EMAIL]"),
    }));
  },
};
```

## Testing & quality

```bash
bunx tsc --noEmit
bun test --coverage
```

## CI/CD

- **CI**: runs typecheck + tests on PRs and pushes to `main`
- **Release**: pushes matching `v*.*.*` create GitHub Releases automatically

## Roadmap

- [ ] Add date-range filtering
- [ ] Built-in noise suppression plugin
- [ ] TUI mode for interactive triage

## Contributing

PRs welcome. Please add/adjust tests for behavior changes.

## License

MIT
