
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { ensurePingalBlogsTable } from "@/lib/blogs";
import { isPingalAdminRequest } from "@/lib/blog-auth";

export const dynamic = "force-dynamic";
const columns = `id, title, slug, excerpt, content, content_blocks AS "contentBlocks",
 featured_image AS "featuredImage", meta_title AS "metaTitle", meta_description AS "metaDescription",
 focus_keyword AS "focusKeyword", canonical_url AS "canonicalUrl", og_title AS "ogTitle",
 og_description AS "ogDescription", og_image AS "ogImage", robots_index AS "robotsIndex",
 robots_follow AS "robotsFollow", status, published_at AS "publishedAt",
 created_at AS "createdAt", updated_at AS "updatedAt"`;
export async function GET(_request, { params }) {
  try {
    await ensurePingalBlogsTable();
    const { slug } = await params;
    const result = await pool.query(`SELECT ${columns} FROM pingal_blogs WHERE slug=$1 AND status='PUBLISHED' LIMIT 1`, [slug]);
    if (!result.rows[0]) return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    return NextResponse.json({ blog: result.rows[0] });
  } catch (error) {
    console.error("Pingal blog GET failed:", error);
    return NextResponse.json({ error: "Unable to load blog" }, { status: 500 });
  }
}
export async function PUT(request, { params }) {
  if (!isPingalAdminRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await ensurePingalBlogsTable();
    const { id } = await params;
    const body = await request.json();
    const title = String(body.title || "").trim();
    const slug = String(body.slug || "").trim().toLowerCase();
    if (!title || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return NextResponse.json({ error: "Enter a title and a valid URL slug." }, { status: 400 });
    }
    const status = body.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
    const blocks = Array.isArray(body.contentBlocks) ? body.contentBlocks : [];
    const values = [title,slug,String(body.excerpt||""),String(body.content||""),JSON.stringify(blocks),String(body.featuredImage||""),String(body.metaTitle||""),String(body.metaDescription||""),String(body.focusKeyword||""),String(body.canonicalUrl||""),String(body.ogTitle||""),String(body.ogDescription||""),String(body.ogImage||""),body.robotsIndex!==false,body.robotsFollow!==false,status,id];
    const result = await pool.query(
      `UPDATE pingal_blogs SET title=$1,slug=$2,excerpt=$3,content=$4,content_blocks=$5::jsonb,featured_image=$6,meta_title=$7,meta_description=$8,focus_keyword=$9,canonical_url=$10,og_title=$11,og_description=$12,og_image=$13,robots_index=$14,robots_follow=$15,status=$16,published_at=CASE WHEN $16='PUBLISHED' THEN COALESCE(published_at,NOW()) ELSE NULL END,updated_at=NOW() WHERE id=$17 RETURNING ${columns}`, values
    );
    if (!result.rows[0]) return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    return NextResponse.json({ blog: result.rows[0] });
  } catch (error) {
    console.error("Pingal blog update failed:", error);
    return NextResponse.json({ error: error?.code === "23505" ? "This blog URL slug already exists." : error.message || "Unable to update blog" }, { status: error?.code === "23505" ? 409 : 400 });
  }
}
export async function DELETE(request, { params }) {
  if (!isPingalAdminRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await ensurePingalBlogsTable();
    const { id } = await params;
    const result = await pool.query("DELETE FROM pingal_blogs WHERE id=$1 RETURNING id", [id]);
    if (!result.rowCount) return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Pingal blog delete failed:", error);
    return NextResponse.json({ error: "Unable to delete blog" }, { status: 500 });
  }
}
