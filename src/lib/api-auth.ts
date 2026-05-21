import { NextRequest, NextResponse } from "next/server";

export function requireApiKey(req: NextRequest): NextResponse | null {
  const key = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!key || key !== process.env.API_SECRET_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
