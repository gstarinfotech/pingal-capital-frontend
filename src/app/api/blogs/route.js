
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { isPingalAdminRequest } from "@/lib/blog-auth";

export const dynamic = "force-dynamic";

async function ensureBlogTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS pingal_blogs (
      id BIGSERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      excerpt TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL DEFAULT '',
      content_blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
      featured_image TEXT NOT NULL DEFAULT '',
      meta_title TEXT NOT NULL DEFAULT '',
      meta_description TEXT NOT NULL DEFAULT '',
      focus_keyword TEXT NOT NULL DEFAULT '',
      canonical_url TEXT NOT NULL DEFAULT '',
      og_title TEXT NOT NULL DEFAULT '',
      og_description TEXT NOT NULL DEFAULT '',
      og_image TEXT NOT NULL DEFAULT '',
      robots_index BOOLEAN NOT NULL DEFAULT TRUE,
      robots_follow BOOLEAN NOT NULL DEFAULT TRUE,
      status TEXT NOT NULL DEFAULT 'DRAFT',
      published_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS pingal_blogs_status_published_idx ON pingal_blogs(status, published_at DESC)`);
}
const columns = `id, title, slug, excerpt, content, content_blocks AS "contentBlocks",
 featured_image AS "featuredImage", meta_title AS "metaTitle", meta_description AS "metaDescription",
 focus_keyword AS "focusKeyword", canonical_url AS "canonicalUrl", og_title AS "ogTitle",
 og_description AS "ogDescription", og_image AS "ogImage", robots_index AS "robotsIndex",
 robots_follow AS "robotsFollow", status, published_at AS "publishedAt",
 created_at AS "createdAt", updated_at AS "updatedAt"`;

function clean(body) {
  const title = String(body.title || "").trim();
  const slug = String(body.slug || "").trim().toLowerCase();
  if (!title) throw new Error("Please enter a blog title.");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error("Use a valid URL slug with lowercase letters, numbers and hyphens.");
  const status = body.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
  const blocks = Array.isArray(body.contentBlocks) ? body.contentBlocks : [];
  return {
    title, slug, excerpt: String(body.excerpt || ""), content: String(body.content || ""),
    contentBlocks: blocks, featuredImage: String(body.featuredImage || ""),
    metaTitle: String(body.metaTitle || ""), metaDescription: String(body.metaDescription || ""),
    focusKeyword: String(body.focusKeyword || ""), canonicalUrl: String(body.canonicalUrl || ""),
    ogTitle: String(body.ogTitle || ""), ogDescription: String(body.ogDescription || ""),
    ogImage: String(body.ogImage || ""), robotsIndex: body.robotsIndex !== false,
    robotsFollow: body.robotsFollow !== false, status,
  };
}
export async function GET(request) {
  try {
    await ensureBlogTable();
    const { searchParams } = new URL(request.url);
    const publishedOnly = searchParams.get("published") === "true";
    if (!publishedOnly && !isPingalAdminRequest(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const result = await pool.query(
      `SELECT ${columns} FROM pingal_blogs ${publishedOnly ? "WHERE status = 'PUBLISHED'" : ""} ORDER BY COALESCE(published_at, updated_at) DESC`
    );
    return NextResponse.json({ blogs: result.rows });
  } catch (error) {
    console.error("Pingal blogs GET failed:", error);
    return NextResponse.json({ error: "Unable to load blogs" }, { status: 500 });
  }
}
export async function POST(request) {
  if (!isPingalAdminRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await ensureBlogTable();
    const data = clean(await request.json());
    const result = await pool.query(
      `INSERT INTO pingal_blogs
      (title, slug, excerpt, content, content_blocks, featured_image, meta_title, meta_description, focus_keyword, canonical_url, og_title, og_description, og_image, robots_index, robots_follow, status, published_at)
      VALUES ($1,$2,$3,$4,$5::jsonb,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,CASE WHEN $16='PUBLISHED' THEN NOW() ELSE NULL END)
      RETURNING ${columns}`,
      [data.title,data.slug,data.excerpt,data.content,JSON.stringify(data.contentBlocks),data.featuredImage,data.metaTitle,data.metaDescription,data.focusKeyword,data.canonicalUrl,data.ogTitle,data.ogDescription,data.ogImage,data.robotsIndex,data.robotsFollow,data.status]
    );
    return NextResponse.json({ blog: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error("Pingal blog create failed:", error);
    const message = error?.code === "23505" ? "This blog URL slug already exists." : error.message || "Unable to save blog";
    return NextResponse.json({ error: message }, { status: error?.code === "23505" ? 409 : 400 });
  }
}
