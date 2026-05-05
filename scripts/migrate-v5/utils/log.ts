import fs from "fs/promises";
import path from "path";

const LOG_PATH = path.join(process.cwd(), "migration-log.jsonl");
const SUMMARY_PATH = path.join(process.cwd(), "migration-summary.json");

interface LogEntry {
  ts: string;
  step: string;
  action: string;
  id?: string;
  details?: Record<string, unknown>;
}

const entries: LogEntry[] = [];
let _dryRun = false;

export function setDryRun(v: boolean) {
  _dryRun = v;
}

export function isDryRun(): boolean {
  return _dryRun;
}

export function log(
  step: string,
  action: string,
  id?: string,
  details?: Record<string, unknown>,
) {
  const entry: LogEntry = {
    ts: new Date().toISOString(),
    step,
    action,
    id,
    details,
  };
  entries.push(entry);

  const prefix = _dryRun ? "\x1b[33m[DRY-RUN]\x1b[0m " : "";
  const idStr = id ? ` \x1b[36m${id}\x1b[0m` : "";
  const detStr = details ? `  ${JSON.stringify(details)}` : "";
  console.log(`${prefix}[\x1b[35m${step}\x1b[0m] ${action}${idStr}${detStr}`);
}

export function warn(step: string, msg: string, id?: string) {
  const entry: LogEntry = { ts: new Date().toISOString(), step, action: `WARN: ${msg}`, id };
  entries.push(entry);
  console.warn(`\x1b[33m[${step}] WARN\x1b[0m ${msg}${id ? ` (${id})` : ""}`);
}

export function error(step: string, msg: string, id?: string) {
  const entry: LogEntry = { ts: new Date().toISOString(), step, action: `ERROR: ${msg}`, id };
  entries.push(entry);
  console.error(`\x1b[31m[${step}] ERROR\x1b[0m ${msg}${id ? ` (${id})` : ""}`);
}

export function summary(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const e of entries) {
    const key = `${e.step}/${e.action.split(":")[0].trim()}`;
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

export async function writeLog() {
  const content = entries.map((e) => JSON.stringify(e)).join("\n");
  await fs.writeFile(LOG_PATH, content, "utf8");

  const s = summary();
  await fs.writeFile(SUMMARY_PATH, JSON.stringify({ dryRun: _dryRun, summary: s }, null, 2), "utf8");

  console.log(`\n\x1b[32mLog written to:\x1b[0m ${LOG_PATH}`);
  console.log(`\x1b[32mSummary written to:\x1b[0m ${SUMMARY_PATH}`);
}
