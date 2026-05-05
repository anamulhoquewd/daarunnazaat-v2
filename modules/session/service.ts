import { schemaValidationError, serverError as buildServerError } from "@/server/error";
import { SessionCycleType } from "@/validations";
import pagination from "@/server/utils/pagination";
import mongoose from "mongoose";
import { SessionV5 } from "./schema";
import { createSessionZ, updateSessionZ } from "./validation";

// ── Period label generator ─────────────────────────────────────────────────────

const EN_MONTHS = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
];

export interface PeriodLabel {
  year: number;
  month: number; // 1-12
  label: string; // e.g. "April 2026"
}

/**
 * Generates an ordered list of {year, month, label} entries starting from
 * session.startDate, for session.monthCount months.
 *
 * Example: startDate=2026-04-01, monthCount=12
 *   → [{year:2026, month:4, label:"April 2026"}, …, {year:2027, month:3, label:"March 2027"}]
 */
export function generatePeriodLabels(session: {
  startDate: Date;
  monthCount: number;
}): PeriodLabel[] {
  const labels: PeriodLabel[] = [];
  const start = new Date(session.startDate);
  let year = start.getFullYear();
  let month = start.getMonth() + 1; // 1-based

  for (let i = 0; i < session.monthCount; i++) {
    labels.push({
      year,
      month,
      label: `${EN_MONTHS[month - 1]} ${year}`,
    });
    month++;
    if (month > 12) {
      month = 1;
      year++;
    }
  }

  return labels;
}

// ── CRUD ───────────────────────────────────────────────────────────────────────

export const createSession = async (
  body: unknown,
  performedBy: string,
) => {
  const parsed = createSessionZ.safeParse(body);
  if (!parsed.success)
    return { error: schemaValidationError(parsed.error, "Invalid request body") };

  try {
    const existing = await SessionV5.findOne({ name: parsed.data.name, isDeleted: false });
    if (existing)
      return {
        error: {
          message: "A session with this name already exists.",
          fields: [{ name: "name", message: "Session name must be unique" }],
        },
      };

    const doc = new SessionV5(parsed.data);
    doc.$locals.performedBy = performedBy;
    const saved = await doc.save();

    return { success: { success: true, message: "Session created", data: saved } };
  } catch (error: any) {
    return {
      serverError: {
        success: false,
        message: error.message,
        stack: process.env.NODE_ENV === "production" ? null : error.stack,
      },
    };
  }
};

export const listSessions = async (params: {
  page: number;
  limit: number;
  sortWith?: string;
  sortOrder?: string;
  cycleType?: SessionCycleType;
  isActive?: boolean;
  search?: string;
}) => {
  try {
    const query: Record<string, unknown> = { isDeleted: false };
    if (params.cycleType) query.cycleType = params.cycleType;
    if (typeof params.isActive === "boolean") query.isActive = params.isActive;
    if (params.search)
      query.$or = [{ name: { $regex: params.search, $options: "i" } }];

    const allowedSort = ["createdAt", "updatedAt", "name", "startDate"];
    const sortField = allowedSort.includes(params.sortWith ?? "") ? params.sortWith! : "startDate";
    const sortDir = params.sortOrder?.toLowerCase() === "asc" ? 1 : -1;

    const [docs, total, totalDocs] = await Promise.all([
      SessionV5.find(query)
        .sort({ [sortField]: sortDir })
        .skip((params.page - 1) * params.limit)
        .limit(params.limit)
        .lean(),
      SessionV5.countDocuments(query),
      SessionV5.countDocuments({ isDeleted: false }),
    ]);

    return {
      success: {
        success: true,
        message: "Sessions fetched successfully",
        data: docs,
        pagination: pagination({ page: params.page, limit: params.limit, total, totalDocs }),
      },
    };
  } catch (error: any) {
    return {
      serverError: { success: false, message: error.message, stack: process.env.NODE_ENV === "production" ? null : error.stack },
    };
  }
};

export const getSession = async (_id: string) => {
  try {
    if (!mongoose.isValidObjectId(_id))
      return { error: { message: "Invalid session ID" } };

    const doc = await SessionV5.findOne({ _id, isDeleted: false });
    if (!doc) return { error: { message: "Session not found" } };

    return { success: { success: true, message: "Session fetched", data: doc } };
  } catch (error: any) {
    return {
      serverError: { success: false, message: error.message, stack: process.env.NODE_ENV === "production" ? null : error.stack },
    };
  }
};

export const updateSession = async (
  _id: string,
  body: unknown,
  performedBy: string,
) => {
  if (!mongoose.isValidObjectId(_id))
    return { error: { message: "Invalid session ID" } };

  const parsed = updateSessionZ.safeParse(body);
  if (!parsed.success)
    return { error: schemaValidationError(parsed.error, "Invalid request body") };

  try {
    const doc = await SessionV5.findOne({ _id, isDeleted: false });
    if (!doc) return { error: { message: "Session not found" } };

    if (Object.keys(parsed.data).length === 0)
      return { success: { success: true, message: "No changes provided", data: doc } };

    Object.assign(doc, parsed.data);
    doc.$locals.performedBy = performedBy;
    const saved = await doc.save();

    return { success: { success: true, message: "Session updated", data: saved } };
  } catch (error: any) {
    return {
      serverError: { success: false, message: error.message, stack: process.env.NODE_ENV === "production" ? null : error.stack },
    };
  }
};

export const activateSession = async (_id: string, performedBy: string) => {
  if (!mongoose.isValidObjectId(_id))
    return { error: { message: "Invalid session ID" } };

  try {
    const doc = await SessionV5.findOne({ _id, isDeleted: false });
    if (!doc) return { error: { message: "Session not found" } };
    if (doc.isActive) return { error: { message: "Session is already active" } };

    doc.isActive = true;
    doc.$locals.performedBy = performedBy;
    await doc.save();

    return { success: { success: true, message: "Session activated" } };
  } catch (error: any) {
    return {
      serverError: { success: false, message: error.message, stack: process.env.NODE_ENV === "production" ? null : error.stack },
    };
  }
};

export const deactivateSession = async (_id: string, performedBy: string) => {
  if (!mongoose.isValidObjectId(_id))
    return { error: { message: "Invalid session ID" } };

  try {
    const doc = await SessionV5.findOne({ _id, isDeleted: false });
    if (!doc) return { error: { message: "Session not found" } };
    if (!doc.isActive) return { error: { message: "Session is already inactive" } };

    doc.isActive = false;
    doc.$locals.performedBy = performedBy;
    await doc.save();

    return { success: { success: true, message: "Session deactivated" } };
  } catch (error: any) {
    return {
      serverError: { success: false, message: error.message, stack: process.env.NODE_ENV === "production" ? null : error.stack },
    };
  }
};

export const softDeleteSession = async (
  _id: string,
  performedBy: string,
  reason: string,
) => {
  if (!mongoose.isValidObjectId(_id))
    return { error: { message: "Invalid session ID" } };

  try {
    const doc = await SessionV5.findOne({ _id, isDeleted: false });
    if (!doc) return { error: { message: "Session not found" } };

    doc.isDeleted = true;
    doc.deletedAt = new Date();
    (doc as any).deletedBy = performedBy;
    doc.deleteReason = reason;
    doc.$locals.performedBy = performedBy;
    await doc.save();

    return { success: { success: true, message: "Session deleted" } };
  } catch (error: any) {
    return {
      serverError: { success: false, message: error.message, stack: process.env.NODE_ENV === "production" ? null : error.stack },
    };
  }
};

export const getSessionPeriods = async (_id: string) => {
  if (!mongoose.isValidObjectId(_id))
    return { error: { message: "Invalid session ID" } };

  try {
    const doc = await SessionV5.findOne({ _id, isDeleted: false }).lean();
    if (!doc) return { error: { message: "Session not found" } };

    const periods = generatePeriodLabels({ startDate: doc.startDate, monthCount: doc.monthCount });
    return { success: { success: true, data: periods } };
  } catch (error: any) {
    return {
      serverError: { success: false, message: error.message, stack: process.env.NODE_ENV === "production" ? null : error.stack },
    };
  }
};
