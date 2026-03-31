import { getAllHosts } from "@/lib/db";

export async function GET() {
  const hosts = getAllHosts();
  return Response.json({ hosts });
}
