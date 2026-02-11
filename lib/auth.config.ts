import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

/**
 * Edge-compatible auth config (no Prisma, no bcryptjs).
 * Used by middleware. The full config in auth.ts extends this.
 */
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    // Credentials provider — authorize is defined in the full config (auth.ts)
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // This authorize function is overridden in auth.ts
      authorize: () => null,
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "USER";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;
      const role = auth?.user?.role;

      // Public paths
      const publicPaths = ["/", "/pricing", "/about", "/login", "/register"];
      if (publicPaths.some((p) => pathname === p)) {
        if (isLoggedIn && (pathname === "/login" || pathname === "/register")) {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }

      // Static assets / auth API
      if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/api/auth") ||
        pathname.startsWith("/api/debug") ||
        pathname.includes(".")
      ) {
        return true;
      }

      // Admin
      if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
        if (!isLoggedIn) return false; // will redirect to signIn page
        if (role !== "ADMIN") {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }

      // Dashboard / protected API
      if (pathname.startsWith("/dashboard") || pathname.startsWith("/api/")) {
        return isLoggedIn;
      }

      return true;
    },
  },
};
