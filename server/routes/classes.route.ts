import { Hono } from "hono";
import { authenticated, authorized } from "../middlewares/auth.middleware";
import { classControllers } from "../controllers";

const classRoutes = new Hono();

classRoutes.get("/", authenticated, (c) => classControllers.gets(c));

classRoutes.post("/register", authenticated, (c) =>
  classControllers.register(c)
);

classRoutes.patch("/:_id", authenticated, (c) => classControllers.updates(c));

classRoutes.get("/:_id", authenticated, (c) => classControllers.get(c));

classRoutes.delete("/:_id", authenticated, authorized, (c) =>
  classControllers.deletes(c)
);

export default classRoutes;
