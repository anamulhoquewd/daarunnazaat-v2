import { badRequestError, serverError } from "@/server/error";
import { authenticate, authorize } from "@/server/middlewares/auth.middleware";
import { UserRole, type IUser } from "@/validations";
import { createRouter } from "@/modules/shared/hono";
import {
  createInvoice,
  generateMonthlyInvoices,
  voidInvoice,
  listInvoices,
  getInvoice,
} from "./service";
import { generateInvoicePDF } from "@/lib/pdf/invoice";
import { Student } from "@/modules/student/schema";
import { Class } from "@/modules/class/schema";

const invoiceRoutes = createRouter();
const adminOnly = authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN);

/** GET /invoices */
invoiceRoutes.get("/", authenticate, adminOnly, async (c) => {
  try {
    const result = await listInvoices(c.req.query() as any);
    if (result.error) return badRequestError(c, result.error);
    if (result.serverError) return serverError(c, result.serverError);
    return c.json(result.success, 200);
  } catch (err: any) {
    return serverError(c, err);
  }
});

/** POST /invoices — create a single invoice */
invoiceRoutes.post("/", authenticate, adminOnly, async (c) => {
  try {
    const body = await c.req.json();
    const user = c.get("user") as IUser;
    const result = await createInvoice({ body, userId: (user as any)._id.toString() });
    if (result.error) return badRequestError(c, result.error);
    if (result.serverError) return serverError(c, result.serverError);
    return c.json(result.success, 201);
  } catch (err: any) {
    return serverError(c, err);
  }
});

/** POST /invoices/generate-monthly — bulk monthly invoice generation */
invoiceRoutes.post("/generate-monthly", authenticate, adminOnly, async (c) => {
  try {
    const body = await c.req.json();
    const user = c.get("user") as IUser;
    const result = await generateMonthlyInvoices({ body, userId: (user as any)._id.toString() });
    if (result.error) return badRequestError(c, result.error);
    if (result.serverError) return serverError(c, result.serverError);
    return c.json(result.success, 200);
  } catch (err: any) {
    return serverError(c, err);
  }
});

/** GET /invoices/:id */
invoiceRoutes.get("/:id", authenticate, adminOnly, async (c) => {
  try {
    const result = await getInvoice(c.req.param("id"));
    if (result.error) return badRequestError(c, result.error);
    if (result.serverError) return serverError(c, result.serverError);
    return c.json(result.success, 200);
  } catch (err: any) {
    return serverError(c, err);
  }
});

/** POST /invoices/:id/void */
invoiceRoutes.post("/:id/void", authenticate, adminOnly, async (c) => {
  try {
    const { reason } = await c.req.json().catch(() => ({ reason: "" }));
    const user = c.get("user") as IUser;

    if (!reason || reason.trim().length < 5) {
      return badRequestError(c, { message: "Void reason must be at least 5 characters" });
    }

    const result = await voidInvoice({
      invoiceId: c.req.param("id"),
      userId: (user as any)._id.toString(),
      reason,
    });
    if (result.error) return badRequestError(c, result.error);
    if (result.serverError) return serverError(c, result.serverError);
    return c.json(result.success, 200);
  } catch (err: any) {
    return serverError(c, err);
  }
});

/** GET /invoices/:id/pdf */
invoiceRoutes.get("/:id/pdf", authenticate, adminOnly, async (c) => {
  try {
    const result = await getInvoice(c.req.param("id"));
    if (result.error) return badRequestError(c, result.error);
    if (result.serverError) return serverError(c, result.serverError);

    const inv = result.success as any;
    const student = await Student.findById(inv.studentId).lean();
    const klass = student ? await Class.findById((student as any).classId).lean() : null;

    const pdfData = {
      invoiceNumber: inv.invoiceNumber,
      invoiceType: inv.invoiceType,
      periodYear: inv.periodYear,
      periodMonth: inv.periodMonth,
      createdAt: new Date(inv.createdAt),
      dueDate: inv.dueDate ? new Date(inv.dueDate) : undefined,
      studentName: (student as any)?.fullName ?? "Unknown",
      studentId: (student as any)?.studentId ?? "",
      branch: inv.branch,
      className: (klass as any)?.className ?? "",
      lineItems: inv.lineItems,
      subtotal: inv.subtotal,
      totalDiscount: inv.totalDiscount,
      adjustmentAmount: inv.adjustmentAmount ?? 0,
      netPayable: inv.netPayable,
      paidAmount: inv.paidAmount,
      dueAmount: inv.dueAmount,
      status: inv.status,
    };

    const pdfBuffer = await generateInvoicePDF(pdfData);

    return new Response(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="invoice-${inv.invoiceNumber}.pdf"`,
        "Content-Length": String(pdfBuffer.length),
      },
    });
  } catch (err: any) {
    return serverError(c, err);
  }
});

export default invoiceRoutes;
