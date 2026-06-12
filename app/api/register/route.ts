import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { createHost, getHostByEmail } from "@/lib/db";
import { createSession, sessionCookie } from "@/lib/auth";
import { randomUUID } from "crypto";

const MAX_TEXT = 2000;
const MAX_TAGS = 10;
// ~1.5MB of base64 ≈ 1.1MB image — the client downscales well below this.
const MAX_PHOTO_BASE64 = 1_500_000;

function asTrimmedString(v: unknown, max = MAX_TEXT): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "不正なリクエストです" }, { status: 400 });
  }

  const email = asTrimmedString(body.email, 254);
  const password = typeof body.password === "string" ? body.password : "";
  const placeName = asTrimmedString(body.placeName, 200);
  const location = asTrimmedString(body.location, 200);

  if (!email || !password || !placeName || !location) {
    return Response.json({ error: "必須項目が不足しています" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "メールアドレスの形式が正しくありません" }, { status: 400 });
  }
  if (password.length < 6) {
    return Response.json({ error: "パスワードは6文字以上で設定してください" }, { status: 400 });
  }

  if (getHostByEmail(email)) {
    return Response.json({ error: "このメールアドレスはすでに登録されています" }, { status: 409 });
  }

  const lat = typeof body.lat === "number" && Number.isFinite(body.lat) ? body.lat : null;
  const lng = typeof body.lng === "number" && Number.isFinite(body.lng) ? body.lng : null;

  let photoBase64: string | null = null;
  if (typeof body.photoBase64 === "string" && body.photoBase64.startsWith("data:image/")) {
    if (body.photoBase64.length > MAX_PHOTO_BASE64) {
      return Response.json({ error: "写真のサイズが大きすぎます" }, { status: 400 });
    }
    photoBase64 = body.photoBase64;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const id = randomUUID();

  createHost({
    id,
    email,
    passwordHash,
    placeName,
    location,
    lat,
    lng,
    hookSentence: asTrimmedString(body.hookSentence),
    tags: Array.isArray(body.tags)
      ? body.tags.map((t) => asTrimmedString(t, 100)).filter(Boolean).slice(0, MAX_TAGS)
      : [],
    hostMessage: asTrimmedString(body.hostMessage),
    passphrase: asTrimmedString(body.passphrase, 100),
    photoBase64,
    status: "active",
    createdAt: Date.now(),
  });

  const token = await createSession(id);

  const response = Response.json({ ok: true, hostId: id });
  response.headers.set("Set-Cookie", sessionCookie(token));
  return response;
}
