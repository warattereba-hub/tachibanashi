import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { getHostByEmail } from "@/lib/db";
import { createSession, sessionCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  let body: { email?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "不正なリクエストです" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return Response.json({ error: "メールアドレスとパスワードを入力してください" }, { status: 400 });
  }

  const host = getHostByEmail(email);
  if (!host?.passwordHash) {
    return Response.json({ error: "メールアドレスまたはパスワードが違います" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, host.passwordHash);
  if (!valid) {
    return Response.json({ error: "メールアドレスまたはパスワードが違います" }, { status: 401 });
  }

  const token = await createSession(host.id);

  const response = Response.json({ ok: true, hostId: host.id });
  response.headers.set("Set-Cookie", sessionCookie(token));
  return response;
}
