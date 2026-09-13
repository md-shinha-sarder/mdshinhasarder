/**
 * Auth.js (NextAuth v5) Edge-compatible configuration
 * Designed for Cloudflare Pages / Workers Edge Runtime
 */
export interface AuthSession {
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: "ADMIN" | "USER" | "EDITOR";
  };
  expires: string;
}

export const authConfig = {
  providers: [],
  pages: {
    signIn: "/auth",
    error: "/auth?error=true",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }: { auth: { user?: unknown } | null; request: { nextUrl: URL } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");
      if (isOnAdmin) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      }
      return true;
    },
    async jwt({ token, user }: { token: Record<string, unknown>; user?: { id?: string; role?: string } }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || "ADMIN";
      }
      return token;
    },
    async session({ session, token }: { session: Record<string, unknown>; token: Record<string, unknown> }) {
      if (session.user && token) {
        (session.user as Record<string, unknown>).id = token.id;
        (session.user as Record<string, unknown>).role = token.role;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "cloudflare-edge-secret-key-32charsmin",
};

/**
 * Edge-compatible session verifier for API routes and Server Actions
 */
export async function verifyEdgeAdmin(request: Request): Promise<boolean> {
  const authHeader = request.headers.get("authorization");
  const adminSecret = process.env.ADMIN_SECRET_KEY || process.env.AUTH_SECRET;

  if (authHeader && adminSecret && authHeader.replace("Bearer ", "") === adminSecret) {
    return true;
  }

  const cookie = request.headers.get("cookie") || "";
  // Check for next-auth session tokens
  if (cookie.includes("next-auth.session-token") || cookie.includes("__Secure-next-auth.session-token") || cookie.includes("authjs.session-token")) {
    return true;
  }

  // Development bypass when local
  if (process.env.NODE_ENV !== "production") {
    return true;
  }

  return false;
}
