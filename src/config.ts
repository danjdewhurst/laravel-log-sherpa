import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

export interface SherpaConfig {
  suppressNoise?: boolean;
  scrubPii?: boolean;
  patternPacks?: string[];
  output?: "table" | "json" | "markdown" | "html" | "sarif" | "slack" | "discord";
  from?: string;
  to?: string;
  includeLevels?: string[];
  excludeLevels?: string[];
  summary?: {
    topMessages?: number;
    topFingerprints?: number;
    topContextValues?: number;
  };
  digest?: {
    top?: number;
    includeFingerprints?: boolean;
  };
  ci?: {
    failOnLevel?: Record<string, number>;
    failOnPatterns?: string[];
  };
  baseline?: {
    file?: string;
  };
  remediation?: {
    playbook?: Array<{ pattern: string; hint: string }>;
  };
}

const CONFIG_FILES = ["log-sherpa.config.ts", "log-sherpa.config.js", "log-sherpa.config.json"];

export async function loadConfig(explicitPath?: string): Promise<SherpaConfig> {
  const candidate = explicitPath
    ? resolve(explicitPath)
    : CONFIG_FILES.map((f) => resolve(process.cwd(), f)).find((f) => existsSync(f));

  if (!candidate || !existsSync(candidate)) {
    return {};
  }

  if (candidate.endsWith(".json")) {
    const data = await Bun.file(candidate).json();
    return (data as SherpaConfig) ?? {};
  }

  const mod = await import(pathToFileURL(candidate).href);
  return (mod.default ?? mod.config ?? {}) as SherpaConfig;
}
