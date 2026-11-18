
import { NextResponse } from "next/server";
import pool from "@/lib/db";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(_request, { params }) {
  try {
    const { id } = await params;
    const result = await pool.query("SELECT mime_type,image_data FROM pingal_blog_images WHERE id=$1 LIMIT 1", [id]);
    if (!result.rows[0]) return new NextResponse("Image not found", { status: 404 });
    return new NextResponse(result.rows[0].image_data, {
      headers: {
        "Content-Type": result.rows[0].mime_type,
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Pingal blog image GET failed:", error);
    return new NextResponse("Unable to load image", { status: 500 });
  }
}
