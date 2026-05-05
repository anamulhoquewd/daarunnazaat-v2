/**
 * Guardian Portal Routes — /guardian-portal
 *
 * Authenticated as GUARDIAN. Returns data scoped to the guardian's own students.
 * Guards against cross-guardian data access by always filtering by guardianId.
 */
import { createRouter } from "@/modules/shared/hono";
import { authenticate, authorize } from "@/server/middlewares/auth.middleware";
import { UserRole, type IUser } from "@/validations";
import { badRequestError, serverError } from "@/server/error/index";
import { Invoice } from "@/modules/invoice/schema";
import { Payment } from "@/modules/payment/schema";
import { Student } from "@/modules/student/schema";
import { Guardian } from "@/modules/guardian/schema";
import { generateReceiptPDF } from "@/lib/pdf/receipt";
import mongoose from "mongoose";

const guardianPortalRoutes = createRouter();
const guardianOnly = authorize(UserRole.GUARDIAN);

/** Resolve guardianId from the logged-in user's userId */
async function getGuardianStudentIds(userId: string): Promise<mongoose.Types.ObjectId[]> {
  const user = await import("@/server/models/users.model").then((m) => m.User.findById(userId).lean());
  if (!user) return [];

  const guardian = await Guardian.findOne({ userId: (user as any)._id }).lean();
  if (!guardian) return [];

  const students = await Student.find(
    { guardianId: (guardian as any)._id, isDeleted: false },
    { _id: 1 },
  ).lean();

  return students.map((s) => s._id as mongoose.Types.ObjectId);
}

/**
 * GET /guardian-portal/invoices
 * Query: studentId?, status?, periodYear?, periodMonth?, page?, limit?
 */
guardianPortalRoutes.get("/invoices", authenticate, guardianOnly, async (c) => {
  try {
    const user = c.get("user") as IUser;
    const ownStudentIds = await getGuardianStudentIds((user as any)._id.toString());

    if (ownStudentIds.length === 0) {
      return c.json({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 }, 200);
    }

    const { studentId, status, periodYear, periodMonth, page = "1", limit = "20" } =
      c.req.query();

    // Ensure requested studentId is owned by this guardian
    const allowedIds = studentId
      ? ownStudentIds.filter((id) => id.toString() === studentId)
      : ownStudentIds;

    if (allowedIds.length === 0) {
      return badRequestError(c, { message: "Student not found or access denied" });
    }

    const filter: any = { studentId: { $in: allowedIds }, isDeleted: false };
    if (status) filter.status = status;
    if (periodYear) filter.periodYear = parseInt(periodYear, 10);
    if (periodMonth) filter.periodMonth = parseInt(periodMonth, 10);

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [data, total] = await Promise.all([
      Invoice.find(filter)
        .populate("studentId", "fullName studentId branch")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Invoice.countDocuments(filter),
    ]);

    return c.json({ data, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) }, 200);
  } catch (err: any) {
    return serverError(c, err);
  }
});

/**
 * GET /guardian-portal/payments
 * Query: studentId?, page?, limit?
 */
guardianPortalRoutes.get("/payments", authenticate, guardianOnly, async (c) => {
  try {
    const user = c.get("user") as IUser;
    const ownStudentIds = await getGuardianStudentIds((user as any)._id.toString());

    if (ownStudentIds.length === 0) {
      return c.json({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 }, 200);
    }

    const { studentId, page = "1", limit = "20" } = c.req.query();

    const allowedIds = studentId
      ? ownStudentIds.filter((id) => id.toString() === studentId)
      : ownStudentIds;

    if (allowedIds.length === 0) {
      return badRequestError(c, { message: "Student not found or access denied" });
    }

    const filter: any = { studentId: { $in: allowedIds }, isDeleted: false };

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [data, total] = await Promise.all([
      Payment.find(filter)
        .populate("studentId", "fullName studentId branch")
        .sort({ paymentDate: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Payment.countDocuments(filter),
    ]);

    return c.json({ data, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) }, 200);
  } catch (err: any) {
    return serverError(c, err);
  }
});

/**
 * GET /guardian-portal/payments/:id/pdf
 * Download receipt PDF for a payment belonging to own student
 */
guardianPortalRoutes.get("/payments/:id/pdf", authenticate, guardianOnly, async (c) => {
  try {
    const user = c.get("user") as IUser;
    const ownStudentIds = await getGuardianStudentIds((user as any)._id.toString());

    const payment = await Payment.findById(c.req.param("id")).lean();
    if (!payment || (payment as any).isDeleted) {
      return badRequestError(c, { message: "Payment not found" });
    }

    // Guard: this payment must belong to one of the guardian's students
    const studentId = (payment as any).studentId?.toString();
    const isOwned = ownStudentIds.some((id) => id.toString() === studentId);
    if (!isOwned) {
      return badRequestError(c, { message: "Access denied" });
    }

    const student = await Student.findById((payment as any).studentId).lean();

    // Build allocations with invoice details
    const allocations = await Promise.all(
      ((payment as any).allocations ?? []).map(async (a: any) => {
        const invoice = await Invoice.findById(a.invoiceId).lean();
        return {
          invoiceNumber: (invoice as any)?.invoiceNumber ?? "—",
          invoiceType: (invoice as any)?.invoiceType ?? "—",
          periodYear: (invoice as any)?.periodYear ?? null,
          periodMonth: (invoice as any)?.periodMonth ?? null,
          allocatedAmount: a.allocatedAmount,
        };
      }),
    );

    const pdfBuffer = await generateReceiptPDF({
      receiptNumber: (payment as any).receiptNumber,
      paymentDate: new Date((payment as any).paymentDate),
      studentName: (student as any)?.fullName ?? "—",
      studentId: (student as any)?.studentId ?? "",
      branch: (payment as any).branch,
      paymentMethod: (payment as any).paymentMethod,
      totalPaid: (payment as any).totalPaid,
      allocations,
      unallocatedAmount: (payment as any).unallocatedAmount,
    });

    return new Response(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="receipt-${(payment as any).receiptNumber}.pdf"`,
        "Content-Length": String(pdfBuffer.length),
      },
    });
  } catch (err: any) {
    return serverError(c, err);
  }
});

export default guardianPortalRoutes;
