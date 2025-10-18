import { NextRequest, NextResponse } from "next/server";
import { decodeJwtPayload } from "./lib/utils";

const AUTH_ROUTE = "/auth/sign-in";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookie = request.cookies.get("refreshToken");
  const token = cookie?.value;

  // ✅ যদি ইউজার /auth route এ থাকে
  if (pathname.startsWith("/auth")) {
    if (token) {
      const decoded = decodeJwtPayload(token);

      // যদি token valid থাকে (expired না)
      if (decoded?.exp && decoded.exp * 1000 > Date.now()) {
        // redirect to home
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    // token না থাকলে বা invalid হলে /auth access করতে দাও
    return NextResponse.next();
  }

  // ✅ /auth ছাড়া অন্য route গুলো — authentication দরকার
  if (!token) {
    return redirectToLogin(request);
  }

  const decoded = decodeJwtPayload(token);
  if (!decoded || decoded.exp < Date.now() / 1000) {
    return redirectToLogin(request);
  }

  // valid হলে normal access
  return NextResponse.next();
}

// Helper function
function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL(AUTH_ROUTE, request.url);
  loginUrl.searchParams.set("from", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

// ✅ Apply middleware globally except some public routes
export const config = {
  matcher: ["/((?!_next|api|public).*)"],
};
