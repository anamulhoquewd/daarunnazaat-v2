import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PREFIXES = ["/dashboard"];
const AUTH_ROUTES = [
  "/auth/sign-in",
  "/auth/forgot-password",
  "/auth/reset-password",
];

const isProtectedPath = (pathname: string) =>
  PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

const isAuthPath = (pathname: string) =>
  AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const refreshToken = request.cookies.get("refreshToken")?.value;

  const hasSession = Boolean(refreshToken);

  if (!hasSession && isProtectedPath(pathname)) {
    const signInUrl = new URL("/auth/sign-in", request.url);
    signInUrl.searchParams.set("from", `${pathname}${search}`);
    return NextResponse.redirect(signInUrl);
  }

  if (hasSession && isAuthPath(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/auth/sign-in",
    "/auth/forgot-password",
    "/auth/reset-password/:path*",
  ],
};
