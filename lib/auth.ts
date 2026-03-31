import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getHostById } from "./db";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "tachibanashi-local-secret-key-change-in-prod"
);
const COOKIE_NAME = "tnsh_session";
const EXPIRY = "7d";

export async function createSession(hostId: string): Promise<string> {
  return new SignJWT({ hostId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .sign(SECRET);
}

export async function verifySession(token: string): Promise<{ hostId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return { hostId: payload.hostId as string };
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

export { COOKIE_NAME };
