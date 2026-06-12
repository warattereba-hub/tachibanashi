import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getHostById } from "./db";

const isProd = process.env.NODE_ENV === "production";

// Checked lazily (not at module load) so `next build` can succeed without the env var.
function getSecret(): Uint8Array {
  if (isProd && !process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is required in production");
  }
  return new TextEncoder().encode(
    process.env.JWT_SECRET ?? "tachibanashi-local-secret-key-change-in-prod"
  );
}
const COOKIE_NAME = "tnsh_session";
const EXPIRY = "7d";
const MAX_AGE = 7 * 24 * 60 * 60;

export async function createSession(hostId: string): Promise<string> {
  return new SignJWT({ hostId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .sign(getSecret());
}

export async function verifySession(token: string): Promise<{ hostId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (typeof payload.hostId !== "string") return null;
    return { hostId: payload.hostId };
  } catch {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = await verifySession(token);
  if (!payload) return null;
  const host = getHostById(payload.hostId);
  return host ? { hostId: payload.hostId, host } : null;
}

export function sessionCookie(token: string): string {
  return `${COOKIE_NAME}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${MAX_AGE}${isProd ? "; Secure" : ""}`;
}

export function clearedSessionCookie(): string {
  return `${COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0${isProd ? "; Secure" : ""}`;
}

export { COOKIE_NAME };
