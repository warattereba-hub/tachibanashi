import { getHostById, toPublicHost } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const host = getHostById(id);
  if (!host) {
    return Response.json({ error: "見つかりません" }, { status: 404 });
  }
  return Response.json({ host: toPublicHost(host) });
}
