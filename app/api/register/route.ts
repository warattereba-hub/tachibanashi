import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { createHost, getHostByEmail } from "@/lib/db";
import { createSession, COOKIE_NAME } from "@/lib/auth";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password, placeName, location, hookSentence, tags, hostMessage, passphrase, lat, lng } = body;

  if (!email || !password || !placeName || !location) {
    return Response.json({ error: "必須項目が不足しています" }, { status: 400 });
  }

  if (getHostByEmail(email)) {
    return Response.json({ error: "このメールアドレスはすでに登録されています" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const id = randomUUID();

  createHost({
    id,
    email,
    passwordHash,
    placeName,
    location,
    lat: lat ?? null,
    lng: lng ?? null,
    hookSentence: hookSentence ?? "",
    tags: Array.isArray(tags) ? tags.filter(Boolean) : [],
    hostMessage: hostMessage ?? "",
    passphrase: passphrase ?? "",
    photoBase64: null,
    status: "active",
    createdAt: Date.now(),
  });

  const token = await createSession(id);

  const response = Response.json({ ok: true, hostId: id });
  (response.headers as Headers).set(
    "Set-Cookie",
    `${COOKIE_NAME}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`
  );
  return response;
}
