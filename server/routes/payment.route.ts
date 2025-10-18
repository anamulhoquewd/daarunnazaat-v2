import { Hono } from "hono";
import { authenticated, authorized } from "../middlewares/auth.middleware";
import { paymentController } from "../controllers";

const paymentRoutes = new Hono();

paymentRoutes.get("/", authenticated, (c) => paymentController.gets(c));

paymentRoutes.post("/register", authenticated, (c) =>
  paymentController.register(c)
);

paymentRoutes.patch("/:_id", authenticated, (c) =>
  paymentController.updates(c)
);

paymentRoutes.get("/:_id", authenticated, (c) => paymentController.get(c));

paymentRoutes.delete("/:_id", authenticated, authorized, (c) =>
  paymentController.deletes(c)
);

export default paymentRoutes;
