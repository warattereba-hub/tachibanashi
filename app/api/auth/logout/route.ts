import { clearedSessionCookie } from "@/lib/auth";

export async function POST() {
  const response = Response.json({ ok: true });
  response.headers.set("Set-Cookie", clearedSessionCookie());
  return response;
}
