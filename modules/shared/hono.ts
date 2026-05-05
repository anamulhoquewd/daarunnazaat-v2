import { Hono } from "hono";
import type { IUser } from "@/validations";

export type AppEnv = { Variables: { user: IUser } };

/** Creates a typed Hono router that knows about the authenticated `user` variable. */
export const createRouter = () => new Hono<AppEnv>();
