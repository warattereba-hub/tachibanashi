import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { updateHost, getHostById } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "未ログイン" }, { status: 401 });
  }
  const { passwordHash: _p, ...publicData } = session.host;
  return Response.json({ host: publicData });
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "未ログイン" }, { status: 401 });
  }

  const body = await request.json();
  const updates: Partial<import("@/lib/db").Host> = {};
  if ("status" in body && (body.status === "active" || body.status === "rest")) {
    updates.status = body.status;
  }
  if ("passphrase" in body && typeof body.passphrase === "string") {
    updates.passphrase = body.passphrase;
  }
  if ("hookSentence" in body && typeof body.hookSentence === "string") {
    updates.hookSentence = body.hookSentence;
  }
  if ("tags" in body && Array.isArray(body.tags)) {
    updates.tags = body.tags as string[];
  }
  if ("hostMessage" in body && typeof body.hostMessage === "string") {
    updates.hostMessage = body.hostMessage;
  }

  const updated = updateHost(session.hostId, updates);
  if (!updated) {
    return Response.json({ error: "更新に失敗しました" }, { status: 500 });
  }

  const { passwordHash: _p, ...publicData } = updated;
  return Response.json({ host: publicData });
}
