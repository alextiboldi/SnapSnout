import "server-only";
import { headers } from "next/headers";

/**
 * Resolve the public origin of the running app. Prefers an explicit env var,
 * then falls back to the actual request headers (works on Vercel/local/proxy)
 * so generated URLs always point at the app, never at the Supabase host.
 */
export async function resolveSiteUrl(): Promise<string> {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
