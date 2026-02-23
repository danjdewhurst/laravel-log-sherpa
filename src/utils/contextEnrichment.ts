import type { LaravelErrorLog, LaravelLogContext } from "../types/error";

const ROUTE_RE = /\broute[=:]\s*([\w\-\/.:{}]+)/i;
const CONTROLLER_RE = /\bcontroller[=:]\s*([\w\\@]+)/i;
const JOB_RE = /\bjob[=:]\s*([\w\\]+)/i;
const REQUEST_ID_RE = /\b(?:request[_-]?id|x-request-id)[=:]\s*([\w-]+)/i;
const CONTROLLER_STACK_RE = /(\w+Controller@\w+)/;

function matchOne(input: string, re: RegExp): string | undefined {
  const m = input.match(re);
  return m?.[1];
}

export function enrichLogContext(log: LaravelErrorLog): LaravelErrorLog {
  const fullText = [log.message, ...log.stack].join("\n");
  const context: LaravelLogContext = {
    route: matchOne(fullText, ROUTE_RE),
    controller: matchOne(fullText, CONTROLLER_RE) ?? matchOne(fullText, CONTROLLER_STACK_RE),
    job: matchOne(fullText, JOB_RE),
    requestId: matchOne(fullText, REQUEST_ID_RE),
  };

  const hasContext = Object.values(context).some(Boolean);
  return hasContext ? { ...log, context } : log;
}

export function enrichContexts(logs: LaravelErrorLog[]): LaravelErrorLog[] {
  return logs.map(enrichLogContext);
}
