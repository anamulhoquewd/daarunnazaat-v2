import { BefaqGrade } from "@/validations";

// ── Befaq Grading System ──────────────────────────────────────────────────────
// Marks (%)       Grade            Arabic Term       Meaning
// 80 – 100        Star/Distinction Mumtaz (ممتاز)   Excellent
// 70 – 79         1st Division     Jayyid Jiddan     Very Good
// 55 – 69         2nd Division     Jayyid (جید)     Good
// 40 – 54         3rd Division     Maqbul (مقبول)   Pass
// below 40        Fail             Rasib (راسب)      Fail
// ─────────────────────────────────────────────────────────────────────────────

export function calcGrade(percentage: number): BefaqGrade {
  if (percentage >= 80) return BefaqGrade.MUMTAZ;
  if (percentage >= 70) return BefaqGrade.JAYYID_JIDDAN;
  if (percentage >= 55) return BefaqGrade.JAYYID;
  if (percentage >= 40) return BefaqGrade.MAQBUL;
  return BefaqGrade.RASIB;
}

export interface SubjectMark {
  marksObtained: number;
  fullMarks: number;
  passMarks: number;
  isAbsent: boolean;
}

export interface CalcResult {
  totalMarks: number;
  totalFullMarks: number;
  percentage: number;
  grade: BefaqGrade;
  isPassed: boolean;
}

/**
 * Calculates aggregate result for a student.
 * isPassed = overall percentage >= 40 AND every non-absent subject >= passMarks
 * An absent subject always causes failure.
 */
export function calcResult(subjects: SubjectMark[]): CalcResult {
  let totalMarks = 0;
  let totalFullMarks = 0;
  let allSubjectsPassed = true;

  for (const s of subjects) {
    totalFullMarks += s.fullMarks;

    if (s.isAbsent) {
      allSubjectsPassed = false;
      continue;
    }

    totalMarks += s.marksObtained;

    if (s.marksObtained < s.passMarks) {
      allSubjectsPassed = false;
    }
  }

  const percentage =
    totalFullMarks === 0 ? 0 : (totalMarks / totalFullMarks) * 100;

  const grade = calcGrade(percentage);
  const isPassed =
    allSubjectsPassed &&
    grade !== BefaqGrade.RASIB;

  return {
    totalMarks,
    totalFullMarks,
    percentage: parseFloat(percentage.toFixed(2)),
    grade,
    isPassed,
  };
}

// ── Position calculation ──────────────────────────────────────────────────────
// Rank by totalMarks descending.
// Ties share the same position; next position skips (1, 2, 2, 4).
// ─────────────────────────────────────────────────────────────────────────────

export interface RankInput {
  studentId: string;
  totalMarks: number;
}

export interface RankOutput {
  studentId: string;
  position: number;
}

export function calcPositions(students: RankInput[]): RankOutput[] {
  const sorted = [...students].sort((a, b) => b.totalMarks - a.totalMarks);

  const result: RankOutput[] = [];
  let position = 1;

  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i].totalMarks < sorted[i - 1].totalMarks) {
      position = i + 1;
    }
    result.push({ studentId: sorted[i].studentId, position });
  }

  return result;
}
