import type { Formatter, LaravelErrorLog, ParsedSummary } from "../types/error";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export class HtmlFormatter implements Formatter {
  format(logs: LaravelErrorLog[], summary: ParsedSummary): string {
    const levelRows = Object.entries(summary.byLevel)
      .map(([level, count]) => `<li><strong>${escapeHtml(level)}</strong>: ${count}</li>`)
      .join("\n");

    const messageRows = summary.topMessages
      .map((msg) => `<li>(${msg.count}) ${escapeHtml(msg.message)}</li>`)
      .join("\n");

    const entries = logs
      .slice(0, 10)
      .map((log) => `<li>[${escapeHtml(log.level)}] ${escapeHtml(log.message)}</li>`)
      .join("\n");

    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Laravel Log Sherpa Summary</title>
  <style>
    :root { --bg:#f6f7f9; --card:#ffffff; --text:#1f2937; --muted:#6b7280; --accent:#0f766e; }
    body { margin:0; font-family: Georgia, 'Times New Roman', serif; background:linear-gradient(120deg,#f6f7f9,#eaf3ef); color:var(--text); }
    main { max-width:900px; margin:2rem auto; background:var(--card); border-radius:14px; padding:1.5rem; box-shadow:0 12px 30px rgba(15,118,110,.08); }
    h1,h2 { margin:.2rem 0 1rem; color:var(--accent); }
    .muted { color:var(--muted); }
  </style>
</head>
<body>
  <main>
    <h1>Laravel Log Sherpa Summary</h1>
    <p class="muted">Total errors: <strong>${summary.total}</strong></p>
    <h2>Levels</h2>
    <ul>${levelRows || "<li>none</li>"}</ul>
    <h2>Top Messages</h2>
    <ul>${messageRows || "<li>none</li>"}</ul>
    <h2>Recent Entries</h2>
    <ul>${entries || "<li>none</li>"}</ul>
  </main>
</body>
</html>`;
  }
}
