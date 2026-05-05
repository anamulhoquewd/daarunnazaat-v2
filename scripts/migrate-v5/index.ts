/**
 * v5 Migration Orchestrator
 *
 * Usage:
 *   BACKUP_DONE=1 MONGODB_URI=<uri> pnpm tsx scripts/migrate-v5/index.ts [options]
 *
 * Options:
 *   --dry-run          Simulate all steps without writing to the database.
 *   --from=<n>         Start from step n (1–7). Skips earlier steps.
 *                      Useful for resuming after a crash mid-migration.
 *   --skip-verify      Skip step 07 (verification). Not recommended for production.
 *
 * Pre-flight checks:
 *   • BACKUP_DONE env var must be set (proof that a DB backup was taken)
 *   • MONGODB_URI env var must be set
 *   • MongoDB must be reachable
 *
 * Steps:
 *   01 — Convert money fields: taka → paisa (×100)
 *   02 — Backfill Session.cycleType, name, monthCount
 *   03 — Remove stale v4 fields from Student documents
 *   04 — Extract Student.sessionHistory → Enrollment collection
 *   05 — Merge FeeCollections by period → Invoice + Payment
 *   06 — Sync Student.creditBalance from Payment.unallocatedAmount
 *   07 — Integrity verification (exits 1 on failure)
 */
import "dotenv/config";
import mongoose from "mongoose";
import * as L from "./utils/log";
import { migrateMoneyFields } from "./01-money";
import { migrateSessions } from "./02-sessions";
import { cleanStudents } from "./03-students";
import { migrateEnrollments } from "./04-enrollments";
import { migrateFeeCollections } from "./05-fee-collection-split";
import { migrateCreditBalances } from "./06-credit-balance";
import { runVerification } from "./07-verify";

// ── CLI args ──────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const SKIP_VERIFY = args.includes("--skip-verify");
const FROM_STEP = (() => {
  const flag = args.find((a) => a.startsWith("--from="));
  const n = flag ? parseInt(flag.split("=")[1]) : 1;
  return isNaN(n) ? 1 : n;
})();

// ── Pre-flight ────────────────────────────────────────────────────────────────

function preflight(): void {
  const errors: string[] = [];

  if (!process.env.BACKUP_DONE) {
    errors.push(
      "BACKUP_DONE env var is not set.\n" +
        "  Take a full MongoDB backup before running the migration, then:\n" +
        "  BACKUP_DONE=1 pnpm tsx scripts/migrate-v5/index.ts",
    );
  }

  if (!process.env.MONGO_URI) {
    errors.push("MONGO_URI env var is not set.");
  }

  if (errors.length > 0) {
    console.error("\n\x1b[31m[MIGRATION] Pre-flight checks failed:\x1b[0m");
    errors.forEach((e) => console.error(`  • ${e}`));
    console.error();
    process.exit(1);
  }
}

// ── Timer helper ──────────────────────────────────────────────────────────────

function elapsed(start: number): string {
  const ms = Date.now() - start;
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  preflight();
  L.setDryRun(DRY_RUN);

  const banner = DRY_RUN
    ? "\x1b[33m[DRY-RUN] No data will be written.\x1b[0m"
    : "\x1b[32mLIVE RUN — data WILL be written to the database.\x1b[0m";

  console.log(`\n\x1b[1m=== Daarunnazaat v5 Migration ===\x1b[0m`);
  console.log(banner);
  if (FROM_STEP > 1) {
    console.log(`\x1b[36mResuming from step ${FROM_STEP}\x1b[0m`);
  }
  console.log();

  const globalStart = Date.now();

  await mongoose.connect(process.env.MONGO_URI!);
  console.log(`Connected to MongoDB: ${process.env.MONGO_URI!.replace(/\/\/.*@/, "//***@")}\n`);

  type Step = { n: number; label: string; run: () => Promise<void> };

  const steps: Step[] = [
    { n: 1, label: "01 — Money fields: taka → paisa", run: () => migrateMoneyFields(DRY_RUN) },
    { n: 2, label: "02 — Session cycleType / name / monthCount", run: () => migrateSessions(DRY_RUN) },
    { n: 3, label: "03 — Remove stale Student fields", run: () => cleanStudents(DRY_RUN) },
    { n: 4, label: "04 — Enrollments from sessionHistory", run: () => migrateEnrollments(DRY_RUN) },
    { n: 5, label: "05 — FeeCollection → Invoice + Payment", run: () => migrateFeeCollections(DRY_RUN) },
    { n: 6, label: "06 — Student.creditBalance", run: () => migrateCreditBalances(DRY_RUN) },
    ...(SKIP_VERIFY
      ? []
      : [{ n: 7, label: "07 — Integrity verification", run: () => runVerification() } as Step]),
  ];

  for (const step of steps) {
    if (step.n < FROM_STEP) continue;

    const stepStart = Date.now();
    console.log(`\x1b[1m── Step ${step.label}\x1b[0m`);

    try {
      await step.run();
    } catch (err: any) {
      console.error(`\x1b[31m[STEP ${step.n}] FATAL: ${err.message}\x1b[0m`);
      console.error(err.stack);
      await L.writeLog();
      await mongoose.disconnect();
      process.exit(1);
    }

    console.log(`   \x1b[90m(${elapsed(stepStart)})\x1b[0m\n`);
  }

  await L.writeLog();
  await mongoose.disconnect();

  console.log(
    `\x1b[1m\x1b[32mMigration complete in ${elapsed(globalStart)}.\x1b[0m` +
      (DRY_RUN ? " \x1b[33m(dry-run — no changes committed)\x1b[0m" : ""),
  );
  console.log("Logs: migration-log.jsonl / migration-summary.json\n");
}

main().catch((err) => {
  console.error("\x1b[31mUnhandled error:\x1b[0m", err);
  process.exit(1);
});
