import { createRouter } from "@/modules/shared/hono";
import { authenticate, authorize } from "@/server/middlewares/auth.middleware";
import { UserRole, OnlinePaymentProvider, type IUser } from "@/validations";
import { badRequestError, serverError } from "@/server/error/index";
import { initiatePayment, confirmPayment, getPaymentStatus } from "./service";
import z from "zod";

const onlinePaymentRoutes = createRouter();
const guardianOnly = authorize(UserRole.GUARDIAN);

const initiateZ = z.object({
  studentId: z.string().min(1),
  invoiceIds: z.array(z.string().min(1)).min(1),
  provider: z.nativeEnum(OnlinePaymentProvider),
});

/** POST /online-payments/initiate — guardian starts a payment */
onlinePaymentRoutes.post("/initiate", authenticate, guardianOnly, async (c) => {
  try {
    const body = await c.req.json();
    const parsed = initiateZ.safeParse(body);
    if (!parsed.success)
      return badRequestError(c, { message: "Invalid request body" });

    const user = c.get("user") as IUser;
    const result = await initiatePayment({
      userId: (user as any)._id.toString(),
      studentId: parsed.data.studentId,
      invoiceIds: parsed.data.invoiceIds,
      provider: parsed.data.provider,
    });
    if (result.error) return badRequestError(c, result.error);
    if (result.serverError) return serverError(c, result.serverError);
    return c.json(result.success, 201);
  } catch (err: any) { return serverError(c, err); }
});

/**
 * POST /online-payments/confirm — dummy callback to simulate bKash/Nagad webhook.
 * In production this endpoint would be called by the payment provider, not the browser.
 * For development/demo, the guardian calls it directly after "paying" in the dummy UI.
 */
onlinePaymentRoutes.post("/confirm", authenticate, guardianOnly, async (c) => {
  try {
    const { transactionRef, providerRef } = await c.req.json();
    if (!transactionRef)
      return badRequestError(c, { message: "transactionRef is required" });

    const user = c.get("user") as IUser;
    const result = await confirmPayment({
      transactionRef,
      providerRef: providerRef ?? `DUMMY-${Date.now()}`,
      userId: (user as any)._id.toString(),
    });
    if (result.error) return badRequestError(c, result.error);
    if (result.serverError) return serverError(c, result.serverError);
    return c.json(result.success, 200);
  } catch (err: any) { return serverError(c, err); }
});

/** GET /online-payments/status/:ref — guardian polls payment status */
onlinePaymentRoutes.get("/status/:ref", authenticate, guardianOnly, async (c) => {
  try {
    const user = c.get("user") as IUser;
    const result = await getPaymentStatus(c.req.param("ref"), (user as any)._id.toString());
    if (result.error) return badRequestError(c, result.error);
    if (result.serverError) return serverError(c, result.serverError);
    return c.json(result.success, 200);
  } catch (err: any) { return serverError(c, err); }
});

export default onlinePaymentRoutes;
