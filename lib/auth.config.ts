import type { NextAuthConfig } from "next-auth";

/**
 * Config "edge-safe": nessun Prisma adapter e nessuna query DB qui dentro,
 * così può girare nel middleware/proxy (Edge runtime). La config completa
 * (con Prisma adapter + Credentials provider) è in lib/auth.ts.
 *
 * jwt/session sono qui (non solo in lib/auth.ts) perché il proxy usa la propria
 * istanza NextAuth(authConfig): senza questi callback anche qui, `auth.user.role`
 * risulterebbe sempre undefined dentro `authorized` e l'accesso a /admin fallirebbe
 * sempre, anche con credenziali corrette.
 */
export const authConfig = {
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedInAsAdmin = auth?.user?.role === "ADMIN";
      const isAdminArea = nextUrl.pathname.startsWith("/admin");
      const isLoginPage = nextUrl.pathname === "/admin/login";

      if (!isAdminArea || isLoginPage) {
        return true;
      }

      return isLoggedInAsAdmin;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: string }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as any;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
