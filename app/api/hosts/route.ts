import { getAllHostPins } from "@/lib/db";

export async function GET() {
  const hosts = getAllHostPins();
  return Response.json({ hosts });
}
