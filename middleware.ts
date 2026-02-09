import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const publicPaths = ["/", "/pricing", "/about", "/login", "/register"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuth = !!req.auth;
  const role = req.auth?.user?.role;

  // Public paths — always allow
  if (publicPaths.some((p) => pathname === p)) {
    // Redirect logged-in users away from auth pages
    if (isAuth && (pathname === "/login" || pathname === "/register")) {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
    }
    return NextResponse.next();
  }

  // Static assets, API auth routes, _next — skip
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Admin routes — require ADMIN role
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (!isAuth) {
      return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
    }
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
    }
    return NextResponse.next();
  }

  // Dashboard & protected API routes — require auth
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/api/")) {
    if (!isAuth) {
      const loginUrl = new URL("/login", req.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
