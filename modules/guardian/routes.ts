import { createRouter } from "@/modules/shared/hono";
import { authenticate, authorize } from "@/server/middlewares/auth.middleware";
import { UserRole, type IUser } from "@/validations";
import { badRequestError, serverError } from "@/server/error/index";
import {
  createGuardian,
  listGuardians,
  getGuardian,
  getMyGuardianProfile,
  updateGuardian,
  updateOwnProfile,
  getGuardianStudents,
  restoreGuardian,
  softDelete,
} from "./service";
import { Guardian } from "./schema";

const guardianRoutes = createRouter();
const adminOnly = authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN);
const adminOrStaff = authorize(
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
  UserRole.STAFF,
);
const guardianOnly = authorize(UserRole.GUARDIAN);

/** GET /guardians/me — own profile */
guardianRoutes.get("/me", authenticate, guardianOnly, async (c) => {
  try {
    const user = c.get("user") as IUser;
    const result = await getMyGuardianProfile((user as any)._id.toString());
    if (result.error) return badRequestError(c, result.error);
    if (result.serverError) return serverError(c, result.serverError);
    return c.json(result.success, 200);
  } catch (err: any) {
    return serverError(c, err);
  }
});

/** PATCH /guardians/me — update own profile */
guardianRoutes.patch("/me", authenticate, guardianOnly, async (c) => {
  try {
    const body = await c.req.json();
    const user = c.get("user") as IUser;
    const result = await updateOwnProfile({
      userId: (user as any)._id.toString(),
      body,
    });
    if (result.error) return badRequestError(c, result.error);
    if (result.serverError) return serverError(c, result.serverError);
    return c.json(result.success, 200);
  } catch (err: any) {
    return serverError(c, err);
  }
});

/** GET /guardians/me/students — own students */
guardianRoutes.get("/me/students", authenticate, guardianOnly, async (c) => {
  try {
    const user = c.get("user") as IUser;
    const profile = await getMyGuardianProfile((user as any)._id.toString());
    if (profile.error) return badRequestError(c, profile.error);
    const result: any = await getGuardianStudents(
      (profile.success as any)._id.toString(),
    );
    if (result.error) return badRequestError(c, result.error);
    if (result.serverError) return serverError(c, result.serverError);
    return c.json(result.success, 200);
  } catch (err: any) {
    return serverError(c, err);
  }
});

guardianRoutes.get("/", authenticate, adminOrStaff, async (c) => {
  try {
    const result = await listGuardians(c.req.query() as any);
    if (result.error) return badRequestError(c, result.error);
    if (result.serverError) return serverError(c, result.serverError);
    return c.json(result.success, 200);
  } catch (err: any) {
    return serverError(c, err);
  }
});

guardianRoutes.post("/", authenticate, adminOnly, async (c) => {
  try {
    const body = await c.req.json();
    const user = c.get("user") as IUser;
    const result = await createGuardian({
      body,
      userId: (user as any)._id.toString(),
    });
    if (result.error) return badRequestError(c, result.error);
    if (result.serverError) return serverError(c, result.serverError);
    return c.json(result.success, 201);
  } catch (err: any) {
    return serverError(c, err);
  }
});

guardianRoutes.get("/:id", authenticate, adminOrStaff, async (c) => {
  try {
    const result = await getGuardian(c.req.param("id"));
    if (result.error) return badRequestError(c, result.error);
    if (result.serverError) return serverError(c, result.serverError);
    return c.json(result.success, 200);
  } catch (err: any) {
    return serverError(c, err);
  }
});

guardianRoutes.patch("/:id", authenticate, adminOnly, async (c) => {
  try {
    const body = await c.req.json();
    const user = c.get("user") as IUser;
    const result = await updateGuardian({
      id: c.req.param("id"),
      body,
      userId: (user as any)._id.toString(),
    });
    if (result.error) return badRequestError(c, result.error);
    if (result.serverError) return serverError(c, result.serverError);
    return c.json(result.success, 200);
  } catch (err: any) {
    return serverError(c, err);
  }
});

// Active/Block/Delete routes can be added similarly with appropriate authorization
guardianRoutes.patch("/:id/activate", authenticate, adminOnly, async (c) => {
  try {
    const user = c.get("user") as IUser;
    const result = await updateGuardian({
      id: c.req.param("id"),
      body: { isActive: true },
      userId: (user as any)._id.toString(),
    });
    if (result.error) return badRequestError(c, result.error);
    if (result.serverError) return serverError(c, result.serverError);
    return c.json({data: result.success.data, message: "Guardian activated successfully"}, 200);
  } catch (err: any) {
    return serverError(c, err);
  }
});

guardianRoutes.patch("/:id/deactivate", authenticate, adminOnly, async (c) => {
  try {
    const user = c.get("user") as IUser;
    const result = await updateGuardian({
      id: c.req.param("id"),
      body: { isActive: false },
      userId: (user as any)._id.toString(),
    });
    if (result.error) return badRequestError(c, result.error);
    if (result.serverError) return serverError(c, result.serverError);
    return c.json({data: result.success.data, message: "Guardian deactivated successfully"}, 200);
  } catch (err: any) {
    return serverError(c, err);
  }
});

// Delete/Restore routes can be implemented similarly
guardianRoutes.delete("/:id", authenticate, adminOnly, async (c) => {
  try {
    const user = c.get("user") as IUser;
    const result = await softDelete({
      id: c.req.param("id"),
      reason: c.req.query("reason") || "No reason provided",
      userId: (user as any)._id.toString(),
    });
    if (result.error) return badRequestError(c, result.error);
    if (result.serverError) return serverError(c, result.serverError);
    return c.json({data: result.success.data, message: "Guardian deleted successfully"}, 200);
  }
    catch (err: any) {  
    return serverError(c, err);
  }
});

guardianRoutes.patch("/:id/restore", authenticate, adminOnly, async (c) => {
  try {
    const user = c.get("user") as IUser;
    const result = await restoreGuardian({
      id: c.req.param("id"),
      userId: (user as any)._id.toString(),
    });
    if (result.error) return badRequestError(c, result.error);
    if (result.serverError) return serverError(c, result.serverError);
    console.log("Restore result: ", result); // Debug log
    return c.json({data: result.success.data, message: "Guardian restored successfully"}, 200);
  } catch (err: any) {
    return serverError(c, err);
  }
});

// Permanent delete route can be implemented similarly
guardianRoutes.delete("/:id/permanent", authenticate, adminOnly, async (c) => {
  try {
    await Guardian.findByIdAndDelete(c.req.param("id"));
    return c.json({ message: "Guardian permanently deleted" }, 200);
  }
    catch (err: any) {
    return serverError(c, err); 
  }
});

export default guardianRoutes;
