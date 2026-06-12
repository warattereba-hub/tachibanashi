import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { updateHost, type Host } from "@/lib/db";

const MAX_TEXT = 2000;
const MAX_TAGS = 10;

// The owner's own record — everything except the password hash.
function ownHost(host: Host): Omit<Host, "passwordHash"> {
  const { passwordHash, ...rest } = host;
  void passwordHash;
  return rest;
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "未ログイン" }, { status: 401 });
  }
  return Response.json({ host: ownHost(session.host) });
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "未ログイン" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "不正なリクエストです" }, { status: 400 });
  }

  const updates: Partial<Host> = {};
  if (body.status === "active" || body.status === "rest") {
    updates.status = body.status;
  }
  if (typeof body.passphrase === "string") {
    updates.passphrase = body.passphrase.trim().slice(0, 100);
  }
  if (typeof body.hookSentence === "string") {
    updates.hookSentence = body.hookSentence.trim().slice(0, MAX_TEXT);
  }
  if (Array.isArray(body.tags)) {
    updates.tags = body.tags
      .filter((t): t is string => typeof t === "string")
      .map((t) => t.trim().slice(0, 100))
      .filter(Boolean)
      .slice(0, MAX_TAGS);
  }
  if (typeof body.hostMessage === "string") {
    updates.hostMessage = body.hostMessage.trim().slice(0, MAX_TEXT);
  }

  const updated = updateHost(session.hostId, updates);
  if (!updated) {
    return Response.json({ error: "更新に失敗しました" }, { status: 500 });
  }

  return Response.json({ host: ownHost(updated) });
}
