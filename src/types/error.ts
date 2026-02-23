export interface LaravelErrorLog {
  level: string;
  timestamp: string;
  environment?: string;
  message: string;
  stack: string[];
  raw: string;
}

export interface ParsedSummary {
  total: number;
  byLevel: Record<string, number>;
  topMessages: Array<{ message: string; count: number }>;
}

export interface Formatter {
  format(logs: LaravelErrorLog[], summary: ParsedSummary): string;
}

export interface LogPlugin {
  name: string;
  parse?(content: string): LaravelErrorLog[];
  transform?(logs: LaravelErrorLog[]): LaravelErrorLog[];
}
