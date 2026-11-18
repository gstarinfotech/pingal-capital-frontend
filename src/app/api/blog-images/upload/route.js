
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { isPingalAdminRequest } from "@/lib/blog-auth";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function ensureImageTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS pingal_blog_images (
      id BIGSERIAL PRIMARY KEY,
      filename TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      image_data BYTEA NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}
export async function POST(request) {
  if (!isPingalAdminRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await ensureImageTable();
    const form = await request.formData();
    const file = form.get("file");
    if (!file || typeof file.arrayBuffer !== "function") {
      return NextResponse.json({ error: "Please choose an image." }, { status: 400 });
    }
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) return NextResponse.json({ error: "Only JPG, PNG, WEBP and GIF images are allowed." }, { status: 400 });
    if (file.size > 4 * 1024 * 1024) return NextResponse.json({ error: "Image must be 4 MB or smaller." }, { status: 400 });
    const bytes = Buffer.from(await file.arrayBuffer());
    const result = await pool.query(
      "INSERT INTO pingal_blog_images(filename,mime_type,image_data) VALUES($1,$2,$3) RETURNING id",
      [String(file.name || "blog-image").slice(0,255), file.type, bytes]
    );
    return NextResponse.json({ success: true, url: `/api/blog-images/${result.rows[0].id}` }, { status: 201 });
  } catch (error) {
    console.error("Pingal blog image upload failed:", error);
    return NextResponse.json({ error: "Image upload failed. Please check the database connection and try again." }, { status: 500 });
  }
}
