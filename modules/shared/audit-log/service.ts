import mongoose from "mongoose";
import { AuditLog } from "./schema";

interface QueryParams {
  collectionName?: string;
  documentId?: string;
  performedBy?: string;
  action?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export const getAuditLogs = async (params: QueryParams) => {
  const {
    collectionName,
    documentId,
    performedBy,
    action,
    from,
    to,
    page = 1,
    limit = 50,
  } = params;

  const filter: Record<string, unknown> = {};

  if (collectionName) filter.collectionName = collectionName;

  if (documentId && mongoose.Types.ObjectId.isValid(documentId))
    filter.documentId = new mongoose.Types.ObjectId(documentId);

  if (performedBy && mongoose.Types.ObjectId.isValid(performedBy))
    filter.performedBy = new mongoose.Types.ObjectId(performedBy);

  if (action) filter.action = action;

  if (from || to) {
    filter.createdAt = {
      ...(from ? { $gte: new Date(from) } : {}),
      ...(to ? { $lte: new Date(to) } : {}),
    };
  }

  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("performedBy", "name email")
      .lean(),
    AuditLog.countDocuments(filter),
  ]);

  return {
    data: logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      nextPage: page * limit < total ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null,
    },
  };
};

/**
 * Convenience: fetch all audit entries for a single document.
 * Useful in detail pages ("see full history for Student/abc").
 */
export const getDocumentHistory = async (
  collectionName: string,
  documentId: string,
) => {
  if (!mongoose.Types.ObjectId.isValid(documentId)) return [];

  return AuditLog.find({
    collectionName,
    documentId: new mongoose.Types.ObjectId(documentId),
  })
    .sort({ createdAt: -1 })
    .populate("performedBy", "name email")
    .lean();
};
