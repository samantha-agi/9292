import { NextResponse } from "next/server";

// Force static so this route is compatible with `output: export` (GitHub Pages).
export const dynamic = "force-static";

export async function GET() {
  return NextResponse.json({ message: "Hello, world!" });
}
