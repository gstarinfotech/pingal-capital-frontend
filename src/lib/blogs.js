
import pool from "@/lib/db";
export async function ensurePingalBlogsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS pingal_blogs (
      id BIGSERIAL PRIMARY KEY, title TEXT NOT NULL, slug TEXT NOT NULL UNIQUE,
      excerpt TEXT NOT NULL DEFAULT '', content TEXT NOT NULL DEFAULT '',
      content_blocks JSONB NOT NULL DEFAULT '[]'::jsonb, featured_image TEXT NOT NULL DEFAULT '',
      meta_title TEXT NOT NULL DEFAULT '', meta_description TEXT NOT NULL DEFAULT '',
      focus_keyword TEXT NOT NULL DEFAULT '', canonical_url TEXT NOT NULL DEFAULT '',
      og_title TEXT NOT NULL DEFAULT '', og_description TEXT NOT NULL DEFAULT '', og_image TEXT NOT NULL DEFAULT '',
      robots_index BOOLEAN NOT NULL DEFAULT TRUE, robots_follow BOOLEAN NOT NULL DEFAULT TRUE,
      status TEXT NOT NULL DEFAULT 'DRAFT', published_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS pingal_blogs_status_published_idx ON pingal_blogs(status, published_at DESC)`);
}
