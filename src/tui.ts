import type { LaravelErrorLog, ParsedSummary } from "./types/error";
import readline from "node:readline";

const PAGE_SIZE = 10;

function renderPage(logs: LaravelErrorLog[], summary: ParsedSummary, page: number): string {
  const totalPages = Math.max(1, Math.ceil(logs.length / PAGE_SIZE));
  const start = page * PAGE_SIZE;
  const pageItems = logs.slice(start, start + PAGE_SIZE);

  const lines = [
    "\x1Bc",
    "Laravel Log Sherpa — Interactive TUI",
    "=".repeat(42),
    `Total: ${summary.total} | Page ${page + 1}/${totalPages}`,
    "",
    ...pageItems.map((entry, i) => {
      const idx = start + i + 1;
      return `${idx}. [${entry.level}] ${entry.timestamp} — ${entry.message}`;
    }),
    "",
    "Commands: [n]ext  [p]rev  [q]uit",
  ];

  return lines.join("\n");
}

export async function runTui(logs: LaravelErrorLog[], summary: ParsedSummary): Promise<void> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  let page = 0;
  const totalPages = Math.max(1, Math.ceil(logs.length / PAGE_SIZE));

  const print = () => {
    process.stdout.write(renderPage(logs, summary, page));
  };

  print();

  await new Promise<void>((resolve) => {
    rl.on("line", (line) => {
      const cmd = line.trim().toLowerCase();
      if (cmd === "n") {
        page = Math.min(totalPages - 1, page + 1);
        print();
        return;
      }
      if (cmd === "p") {
        page = Math.max(0, page - 1);
        print();
        return;
      }
      if (cmd === "q") {
        rl.close();
        resolve();
      }
    });
  });
}
