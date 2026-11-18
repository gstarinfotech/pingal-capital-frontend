
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import pool from "@/lib/db";
import { ensurePingalBlogsTable } from "@/lib/blogs";

export const dynamic = "force-dynamic";
async function getBlog(slug) {
  try {
    await ensurePingalBlogsTable();
    const result = await pool.query(`
      SELECT id,title,slug,excerpt,content,content_blocks AS "contentBlocks",
        featured_image AS "featuredImage",meta_title AS "metaTitle",meta_description AS "metaDescription",
        canonical_url AS "canonicalUrl",og_title AS "ogTitle",og_description AS "ogDescription",
        og_image AS "ogImage",robots_index AS "robotsIndex",robots_follow AS "robotsFollow",
        published_at AS "publishedAt",created_at AS "createdAt"
      FROM pingal_blogs WHERE slug=$1 AND status='PUBLISHED' LIMIT 1
    `,[slug]);
    return result.rows[0] || null;
  } catch (error) {
    console.error("Public blog detail failed:",error);
    return null;
  }
}
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const blog = await getBlog(slug);
  if (!blog) return { title: "Blog not found | Pingal Capital" };
  const title = blog.metaTitle || blog.title;
  const description = blog.metaDescription || blog.excerpt || "Insights from Pingal Capital.";
  const image = blog.ogImage || blog.featuredImage;
  return {
    title, description,
    alternates: { canonical: blog.canonicalUrl || `https://www.pingalcapital.com/blogs/${blog.slug}` },
    robots: { index: blog.robotsIndex !== false, follow: blog.robotsFollow !== false },
    openGraph: { type: "article", title: blog.ogTitle || title, description: blog.ogDescription || description, images: image ? [image] : [] },
    twitter: { card: "summary_large_image", title: blog.ogTitle || title, description: blog.ogDescription || description, images: image ? [image] : [] },
  };
}
function dateLabel(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-IN",{day:"numeric",month:"long",year:"numeric"}).format(new Date(value));
}
function ContentBlock({ block }) {
  if (block.type==="heading") {
    const Tag = Number(block.level)===3 ? "h3" : "h2";
    return <Tag className={`${Tag==="h2"?"mt-10 text-2xl sm:text-3xl":"mt-8 text-xl sm:text-2xl"} font-playfair font-bold leading-snug text-[#102b5d]`}>{block.text}</Tag>;
  }
  if (block.type==="paragraph") return <p className="mt-5 whitespace-pre-line text-[15px] leading-8 text-slate-600">{block.text}</p>;
  if (block.type==="image") return <figure className="my-8">{block.src&&<img src={block.src} alt={block.alt||""} className="max-h-[620px] w-full rounded-2xl object-cover"/>}{block.caption&&<figcaption className="mt-2 text-center text-xs text-slate-400">{block.caption}</figcaption>}</figure>;
  if (block.type==="list") return <ul className="mt-5 list-disc space-y-2 pl-6 text-[15px] leading-7 text-slate-600">{(block.items||[]).filter(Boolean).map((item,i)=><li key={i}>{item}</li>)}</ul>;
  return null;
}
export default async function BlogDetailPage({ params }) {
  const { slug } = await params;
  const blog = await getBlog(slug);
  if (!blog) notFound();
  const blocks = Array.isArray(blog.contentBlocks) ? blog.contentBlocks : [];
  return (
    <main className="min-h-screen bg-white">
      <div className="bg-[#0B2E6F]">
        <Navbar />
      </div>
      <article>
        <div className="bg-[#0a2660] px-5 pb-14 pt-14 text-white sm:pb-20 sm:pt-20">
          <div className="mx-auto max-w-4xl">
            <Link href="/blogs" className="mb-8 inline-flex items-center gap-2 text-xs font-semibold text-blue-100 transition hover:text-[#e5bd59]">← All articles</Link>
            <p className="mb-4 text-xs font-bold uppercase tracking-[.22em] text-[#e5bd59]">Pingal Capital Insights</p>
            <h1 className="font-playfair text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">{blog.title}</h1>
            {blog.excerpt&&<p className="mt-5 max-w-3xl text-base leading-7 text-blue-100">{blog.excerpt}</p>}
            <p className="mt-6 text-xs text-blue-200">{dateLabel(blog.publishedAt||blog.createdAt)}</p>
          </div>
        </div>
        <div className="mx-auto max-w-5xl px-5 pb-20 pt-10 sm:px-8 sm:pt-14">
          <div className="mx-auto max-w-3xl">
            {blocks.length ? blocks.map((block,index)=><ContentBlock key={index} block={block}/>) : <div className="whitespace-pre-line text-[15px] leading-8 text-slate-600">{blog.content}</div>}
            <div className="mt-14 border-t border-slate-200 pt-7"><Link href="/blogs" className="inline-flex items-center gap-2 rounded-full border border-[#0D3785] px-5 py-3 text-sm font-semibold text-[#0D3785] transition hover:bg-[#0D3785] hover:text-white">← Back to all articles</Link></div>
          </div>
        </div>
      </article>
      <Footer />
    </main>
  );
}
