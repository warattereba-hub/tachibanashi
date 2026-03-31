import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { getHostByEmail } from "@/lib/db";
import { createSession, COOKIE_NAME } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return Response.json({ error: "メールアドレスとパスワードを入力してください" }, { status: 400 });
  }

  const host = getHostByEmail(email);
  if (!host) {
    return Response.json({ error: "メールアドレスまたはパスワードが違います" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, host.passwordHash);
  if (!valid) {
    return Response.json({ error: "メールアドレスまたはパスワードが違います" }, { status: 401 });
  }

  const token = await createSession(host.id);

  const response = Response.json({ ok: true, hostId: host.id });
  (response.headers as Headers).set(
    "Set-Cookie",
    `${COOKIE_NAME}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`
  );
  return response;
}
