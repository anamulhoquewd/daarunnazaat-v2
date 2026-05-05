import { badRequestError, serverError } from "@/server/error";
import { authenticate, authorize } from "@/server/middlewares/auth.middleware";
import { UserRole, type IUser } from "@/validations";
import { createRouter } from "@/modules/shared/hono";
import { createPayment, deletePayment, listPayments, getPayment } from "./service";
import { generateReceiptPDF } from "@/lib/pdf/receipt";
import { Invoice } from "@/modules/invoice/schema";

const paymentRoutes = createRouter();
const adminOnly = authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN);

/** GET /payments */
paymentRoutes.get("/", authenticate, adminOnly, async (c) => {
  try {
    const result = await listPayments(c.req.query() as any);
    if (result.error) return badRequestError(c, result.error);
    if (result.serverError) return serverError(c, result.serverError);
    return c.json(result.success, 200);
  } catch (err: any) {
    return serverError(c, err);
  }
});

/** POST /payments */
paymentRoutes.post("/", authenticate, adminOnly, async (c) => {
  try {
    const body = await c.req.json();
    const user = c.get("user") as IUser;
    const result = await createPayment({ body, userId: (user as any)._id.toString() });
    if (result.error) return badRequestError(c, result.error);
    if (result.serverError) return serverError(c, result.serverError);
    return c.json(result.success, 201);
  } catch (err: any) {
    return serverError(c, err);
  }
});

/** GET /payments/:id */
paymentRoutes.get("/:id", authenticate, adminOnly, async (c) => {
  try {
    const result = await getPayment(c.req.param("id"));
    if (result.error) return badRequestError(c, result.error);
    if (result.serverError) return serverError(c, result.serverError);
    return c.json(result.success, 200);
  } catch (err: any) {
    return serverError(c, err);
  }
});

/** DELETE /payments/:id — 5-min undo */
paymentRoutes.delete("/:id", authenticate, adminOnly, async (c) => {
  try {
    const user = c.get("user") as IUser;
    const { reason } = await c.req.json().catch(() => ({ reason: undefined }));
    const result = await deletePayment({
      paymentId: c.req.param("id"),
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

/** GET /payments/:id/pdf */
paymentRoutes.get("/:id/pdf", authenticate, adminOnly, async (c) => {
  try {
    const result = await getPayment(c.req.param("id"));
    if (result.error) return badRequestError(c, result.error);
    if (result.serverError) return serverError(c, result.serverError);

    const payment = result.success as any;

    // Build receipt allocations with invoice details
    const allocations = await Promise.all(
      (payment.allocations ?? []).map(async (a: any) => {
        const inv = await Invoice.findById(
          typeof a.invoiceId === "object" && a.invoiceId?._id
            ? a.invoiceId._id
            : a.invoiceId,
        ).lean();
        return {
          invoiceNumber: (inv as any)?.invoiceNumber ?? "—",
          invoiceType: (inv as any)?.invoiceType ?? "—",
          periodYear: (inv as any)?.periodYear ?? null,
          periodMonth: (inv as any)?.periodMonth ?? null,
          allocatedAmount: a.allocatedAmount,
        };
      }),
    );

    const pdfBuffer = await generateReceiptPDF({
      receiptNumber: payment.receiptNumber,
      paymentDate: new Date(payment.paymentDate),
      studentName: (payment.studentId as any)?.fullName ?? payment.studentId?.toString() ?? "—",
      studentId: (payment.studentId as any)?.studentId ?? "",
      branch: payment.branch,
      paymentMethod: payment.paymentMethod,
      totalPaid: payment.totalPaid,
      allocations,
      unallocatedAmount: payment.unallocatedAmount,
      notes: payment.notes,
    });

    return new Response(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="receipt-${payment.receiptNumber}.pdf"`,
        "Content-Length": String(pdfBuffer.length),
      },
    });
  } catch (err: any) {
    return serverError(c, err);
  }
});

export default paymentRoutes;
