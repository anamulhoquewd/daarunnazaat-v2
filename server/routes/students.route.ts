import { Hono } from "hono";
import { authenticated, authorized } from "../middlewares/auth.middleware";
import { studentController } from "../controllers";

const studentsRoutes = new Hono();

studentsRoutes.get("/", authenticated, (c) => studentController.gets(c));

studentsRoutes.post("/register", authenticated, (c) =>
  studentController.register(c)
);

studentsRoutes.patch("/:_id", authenticated, (c) =>
  studentController.updates(c)
);

studentsRoutes.get("/:_id", authenticated, (c) => studentController.get(c));

studentsRoutes.delete("/:_id", authenticated, authorized, (c) =>
  studentController.deletes(c)
);

export default studentsRoutes;
