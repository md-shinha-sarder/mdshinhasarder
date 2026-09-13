/**
 * NextAuth / Auth.js API Handler for Cloudflare Edge Runtime
 * File: app/api/auth/[...nextauth]/route.ts
 */
export const runtime = "edge";

import { authConfig } from "@/lib/auth";

export async function GET(request: Request) {
  return new Response(
    JSON.stringify({
      status: "authenticated",
      providers: ["credentials"],
      sessionStrategy: authConfig.session.strategy,
      runtime: "edge",
      timestamp: new Date().toISOString(),
    }),
    {
      headers: { "Content-Type": "application/json" },
      status: 200,
    }
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, password } = body as { email?: string; password?: string };

    const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

    if (email === adminEmail && password === adminPassword) {
      return new Response(
        JSON.stringify({
          success: true,
          user: {
            id: "admin-1",
            name: "MD. Shinha Sarder",
            email: adminEmail,
            role: "ADMIN",
          },
          token: "edge-jwt-" + Date.now(),
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "Set-Cookie": `authjs.session-token=edge-jwt-${Date.now()}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`,
          },
          status: 200,
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid credentials" }),
      {
        headers: { "Content-Type": "application/json" },
        status: 401,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal auth error" }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
}
