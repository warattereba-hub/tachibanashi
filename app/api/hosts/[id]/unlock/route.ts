import { NextRequest } from "next/server";
import { getHostById } from "@/lib/db";

// Verify the host's passphrase server-side so it is never sent to visitors.
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const host = getHostById(id);
  if (!host) {
    return Response.json({ error: "見つかりません" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "不正なリクエストです" }, { status: 400 });
  }

  const input = (body as { passphrase?: unknown })?.passphrase;
  const stored = host.passphrase?.trim();
  if (!stored || typeof input !== "string") {
    return Response.json({ ok: false }, { status: 401 });
  }

  if (stored.toLowerCase() === input.trim().toLowerCase()) {
    return Response.json({ ok: true, hostMessage: host.hostMessage ?? "" });
  }
  return Response.json({ ok: false }, { status: 401 });
}
