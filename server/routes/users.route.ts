import { Hono } from "hono";
import { usersController } from "../controllers";

const userRoutes = new Hono();

userRoutes.get("/", (c) => usersController.getUsers(c));

userRoutes.get("/me", (c) => usersController.getMe(c));

// userRoutes.get("/:_id", (c) => usersController.get(c));

export default userRoutes;
