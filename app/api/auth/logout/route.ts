import { COOKIE_NAME } from "@/lib/auth";

export async function POST() {
  const response = Response.json({ ok: true });
  (response.headers as Headers).set(
    "Set-Cookie",
    `${COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`
  );
  return response;
}
