import { z } from "zod";

// ── Display ────────────────────────────────────────────────────────────────────

/**
 * Convert paisa (integer) to human-readable taka string — always English digits.
 *   toMoney(150000)  → "1,500.00"
 *   toMoney(3333)    → "33.33"
 *   toMoney(0)       → "0.00"
 */
export const toMoney = (paisa: number, _locale?: string): string => {
  const taka = paisa / 100;
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(taka);
};

// ── Parsing ────────────────────────────────────────────────────────────────────

/**
 * Parse taka input (string or number) → integer paisa.
 *   fromMoney("1,500.50") → 150050
 *   fromMoney(33.33)      → 3333
 *   fromMoney("500")      → 50000
 * Throws if input is not a valid non-negative number.
 */
export const fromMoney = (input: string | number): number => {
  const cleaned = String(input).replace(/,/g, "").trim();
  const taka = parseFloat(cleaned);
  if (isNaN(taka) || taka < 0) throw new Error(`Invalid amount: "${input}"`);
  return Math.round(taka * 100);
};

// ── Arithmetic ─────────────────────────────────────────────────────────────────

export const sumPaisa = (values: number[]): number =>
  values.reduce((acc, v) => acc + v, 0);

export const addPaisa = (a: number, b: number): number => a + b;

export const subtractPaisa = (a: number, b: number): number => a - b;

// ── Zod helpers ────────────────────────────────────────────────────────────────

/** Integer paisa, >= 0. Use for Mongoose schema fields. */
export const paisaSchema = z.number().int().nonnegative();

/**
 * Accepts taka as string ("33.33", "1,500") or number (33.33, 1500),
 * transforms to integer paisa. Use for API/form inputs.
 */
export const moneyInputSchema = z
  .union([z.string(), z.number()])
  .transform((v) => fromMoney(v))
  .pipe(paisaSchema);

/** Optional money input — undefined/null passes through as undefined. */
export const optionalMoneyInputSchema = z
  .union([z.string(), z.number(), z.undefined(), z.null()])
  .transform((v) => (v == null || v === "" ? undefined : fromMoney(v)))
  .pipe(paisaSchema.optional());
