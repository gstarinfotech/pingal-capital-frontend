
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import pool from "@/lib/db";
import { ensurePingalBlogsTable } from "@/lib/blogs";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Insights & Articles | Pingal Capital",
  description: "Explore insights, financial guidance and updates from Pingal Capital.",
  alternates: { canonical: "https://www.pingalcapital.com/blogs" },
};

async function getBlogs() {
  try {
    await ensurePingalBlogsTable();
    const result = await pool.query(`
      SELECT id,title,slug,excerpt,featured_image AS "featuredImage",
             published_at AS "publishedAt",created_at AS "createdAt"
      FROM pingal_blogs WHERE status='PUBLISHED'
      ORDER BY COALESCE(published_at,created_at) DESC
    `);
    return result.rows;
  } catch (error) {
    console.error("Public blog listing failed:", error);
    return [];
  }
}
function dateLabel(value) {
  if (!value) return "Latest insight";
  return new Intl.DateTimeFormat("en-IN", { day:"numeric", month:"long", year:"numeric" }).format(new Date(value));
}
export default async function BlogsPage() {
  const blogs = await getBlogs();
  return (
    <main className="min-h-screen bg-[#f8f9fc]">
      <div className="bg-[#0B2E6F]">
        <Navbar />
      </div>
      <section className="relative overflow-hidden bg-[#0a2660] px-5 pb-20 pt-20 text-white sm:pb-24 sm:pt-28">
        <div className="absolute -right-24 -top-28 h-96 w-96 rounded-full bg-[#d4a437]/15 blur-3xl"/>
        <div className="relative mx-auto max-w-7xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[.28em] text-[#e5bd59]">Pingal Capital Insights</p>
          <h1 className="max-w-3xl font-playfair text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">Ideas that move your <span className="text-[#e5bd59]">business forward.</span></h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-blue-100 sm:text-base">Financial perspectives, funding knowledge and practical guidance to help you make confident decisions.</p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-3">
          <div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#b58a2c]">Explore our articles</p><h2 className="mt-2 font-playfair text-3xl font-bold text-[#102b5d] sm:text-4xl">Latest insights</h2></div>
          <p className="text-sm text-slate-500">{blogs.length} {blogs.length===1?"article":"articles"}</p>
        </div>
        {blogs.length===0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm"><div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-[#0D3785]"><span className="text-2xl">✦</span></div><h3 className="font-playfair text-2xl font-semibold text-[#102b5d]">Fresh perspectives are on the way</h3><p className="mt-2 text-sm text-slate-500">Please check back soon for our latest articles and updates.</p></div>
        ) : (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog,index)=>(
              <article key={blog.id} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(16,43,93,.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(16,43,93,.12)]">
                <Link href={`/blogs/${blog.slug}`} className="relative block aspect-[16/10] overflow-hidden bg-slate-100">
                  {blog.featuredImage ? <img src={blog.featuredImage} alt={blog.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105"/> : <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#0a2660] to-[#16458d] font-playfair text-4xl text-white/80">Pingal</div>}
                  <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#0D3785]">Insights</span>
                </Link>
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-xs font-medium text-slate-400">{dateLabel(blog.publishedAt || blog.createdAt)}</p>
                  <h3 className="mt-3 font-playfair text-xl font-bold leading-snug text-[#102b5d] transition-colors group-hover:text-[#0D3785]"><Link href={`/blogs/${blog.slug}`}>{blog.title}</Link></h3>
                  <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-slate-500">{blog.excerpt || "Explore this insight from Pingal Capital."}</p>
                  <Link href={`/blogs/${blog.slug}`} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#0D3785]">Read article <span className="transition-transform group-hover:translate-x-1">→</span></Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
      <Footer />
    </main>
  );
}
