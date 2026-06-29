import { NextResponse } from "next/server";
import { listCategories } from "@/lib/repositories/categories";

export async function GET() {
  const categories = await listCategories().catch(() => []);
  return NextResponse.json(categories);
}
