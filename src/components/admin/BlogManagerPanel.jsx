
"use client";
import { useEffect, useMemo, useState } from "react";
import { Plus, FileText, ImagePlus, Trash2, Pencil, Eye, Save, X, ChevronUp, ChevronDown, Loader2, Search } from "lucide-react";

const empty = {
  title: "", slug: "", excerpt: "", featuredImage: "", intro: "", contentBlocks: [],
  metaTitle: "", metaDescription: "", focusKeyword: "", canonicalUrl: "",
  ogTitle: "", ogDescription: "", ogImage: "", robotsIndex: true, robotsFollow: true,
  status: "DRAFT",
};
const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition focus:border-[#0D3785] focus:ring-2 focus:ring-blue-100";
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500";

export default function BlogManagerPanel() {
  const [blogs, setBlogs] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  async function loadBlogs() {
    setLoading(true);
    try {
      const response = await fetch("/api/blogs", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to load blogs");
      setBlogs(data.blogs || []);
    } catch (e) { setError(e.message || "Unable to load blogs"); }
    finally { setLoading(false); }
  }
  useEffect(() => { loadBlogs(); }, []);

  const visibleBlogs = useMemo(() => blogs.filter((blog) =>
    `${blog.title} ${blog.slug}`.toLowerCase().includes(search.toLowerCase())
  ), [blogs, search]);

  function update(key, value) { setForm((current) => ({ ...current, [key]: value })); }
  function newBlog() { setEditingId(null); setForm(empty); setMessage(""); setError(""); }
  function editBlog(blog) {
    const savedBlocks = Array.isArray(blog.contentBlocks) ? blog.contentBlocks : [];
    const introBlock = savedBlocks.find((block) => block.type === "intro");
    setEditingId(blog.id);
    setForm({
      ...empty,
      ...blog,
      intro: blog.intro || introBlock?.text || "",
      contentBlocks: savedBlocks.filter((block) => block.type !== "intro"),
    });
    setMessage(""); setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function addBlock(type) {
    const block = type === "heading" ? { type, level: 2, text: "" }
      : type === "paragraph" ? { type, text: "" }
      : type === "image" ? { type, src: "", alt: "", caption: "" }
      : { type, items: [""] };
    update("contentBlocks", [...form.contentBlocks, block]);
  }
  function patchBlock(index, patch) {
    update("contentBlocks", form.contentBlocks.map((block, i) => i === index ? { ...block, ...patch } : block));
  }
  function removeBlock(index) { update("contentBlocks", form.contentBlocks.filter((_, i) => i !== index)); }
  function moveBlock(index, direction) {
    const blocks = [...form.contentBlocks]; const target = index + direction;
    if (target < 0 || target >= blocks.length) return;
    [blocks[index], blocks[target]] = [blocks[target], blocks[index]];
    update("contentBlocks", blocks);
  }
  async function uploadImage(file, onUploaded) {
    if (!file) return;
    setUploading(true); setError(""); setMessage("");
    try {
      const body = new FormData(); body.append("file", file);
      const response = await fetch("/api/blog-images/upload", { method: "POST", body });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Image upload failed");
      onUploaded(data.url);
      setMessage("Image uploaded successfully.");
    } catch (e) { setError(e.message || "Image upload failed"); }
    finally { setUploading(false); }
  }
  async function saveBlog(event) {
    event.preventDefault(); setError(""); setMessage("");
    const title = form.title.trim();
    const slug = form.slug.trim().toLowerCase();
    if (!title) return setError("Please enter a blog title.");
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return setError("Use a valid URL slug, for example business-funding-guide.");
    setSaving(true);
    try {
      const articleBlocks = [
        ...(form.intro.trim() ? [{ type: "intro", text: form.intro.trim() }] : []),
        ...(form.contentBlocks || []),
      ];
      const payload = { ...form, title, slug, contentBlocks: articleBlocks, content: JSON.stringify(articleBlocks) };
      const response = await fetch(editingId ? `/api/blogs/${editingId}` : "/api/blogs", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to save blog");
      setMessage(form.status === "PUBLISHED" ? "Blog published successfully. It is now available on the website." : "Draft saved successfully.");
      setEditingId(data.blog?.id || null);
      if (data.blog) {
        const savedBlocks = Array.isArray(data.blog.contentBlocks) ? data.blog.contentBlocks : articleBlocks;
        const introBlock = savedBlocks.find((block) => block.type === "intro");
        setForm({
          ...empty,
          ...data.blog,
          intro: data.blog.intro || introBlock?.text || form.intro,
          contentBlocks: savedBlocks.filter((block) => block.type !== "intro"),
        });
      }
      await loadBlogs();
    } catch (e) { setError(e.message || "Unable to save blog"); }
    finally { setSaving(false); }
  }
  async function deleteBlog(blog) {
    if (!window.confirm(`Delete "${blog.title}" permanently?`)) return;
    setError(""); setMessage("");
    try {
      const response = await fetch(`/api/blogs/${blog.id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Delete failed");
      if (String(editingId) === String(blog.id)) newBlog();
      setMessage("Blog deleted."); await loadBlogs();
    } catch (e) { setError(e.message || "Delete failed"); }
  }

  return (
    <div className="min-h-full bg-[#f5f7fb] px-4 py-6 sm:px-7 lg:px-9">
      <div className="mx-auto max-w-[1450px]">
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div><div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.18em] text-[#0D3785]"><FileText size={15}/> Website content</div>
            <h1 className="font-playfair text-3xl font-bold text-[#102b5d]">Blog Management</h1>
            <p className="mt-1 text-sm text-slate-500">Create articles, upload images and publish them directly to the website.</p></div>
          <button type="button" onClick={newBlog} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0D3785] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#092a69]"><Plus size={17}/> New blog</button>
        </div>

        {message && <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</div>}
        {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <form onSubmit={saveBlog} className="grid items-start gap-6 2xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4"><div><h2 className="font-semibold text-slate-800">{editingId ? "Edit article" : "Create a new article"}</h2><p className="mt-1 text-xs text-slate-500">Basic information and featured image</p></div>{editingId && <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">Editing #{editingId}</span>}</div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2"><label className={labelClass}>Blog title *</label><input className={inputClass} value={form.title} onChange={e => { const title=e.target.value; update("title",title); if (!editingId) update("slug",title.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"")); }} placeholder="Enter an engaging blog title" required /></div>
                <div className="md:col-span-2"><label className={labelClass}>URL slug *</label><div className="flex overflow-hidden rounded-xl border border-slate-200 focus-within:border-[#0D3785]"><span className="bg-slate-50 px-3 py-3 text-xs text-slate-500">/blogs/</span><input className="min-w-0 flex-1 px-3 py-3 text-sm outline-none" value={form.slug} onChange={e => update("slug",e.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,""))} placeholder="business-funding-guide" required /></div></div>
                <div className="md:col-span-2"><label className={labelClass}>Short description / excerpt</label><textarea className={inputClass} rows={3} value={form.excerpt} onChange={e => update("excerpt",e.target.value)} placeholder="A short summary shown on the blog listing page..." /></div>
              </div>
              <div className="mt-5">
                <label className={labelClass}>Featured image</label>
                <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-4">
                  {form.featuredImage ? <div className="relative"><img src={form.featuredImage} alt="Featured preview" className="max-h-72 w-full rounded-lg object-cover"/><button type="button" onClick={() => update("featuredImage","")} className="absolute right-2 top-2 rounded-lg bg-white/95 p-2 text-red-600 shadow"><X size={16}/></button></div> : <label className="flex cursor-pointer flex-col items-center justify-center py-8 text-center"><ImagePlus size={30} className="mb-2 text-[#0D3785]"/><span className="text-sm font-semibold text-slate-700">Upload featured image</span><span className="mt-1 text-xs text-slate-500">JPG, PNG, WEBP or GIF · Max 4 MB</span><input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" disabled={uploading} onChange={e => { const file=e.target.files?.[0]; if(file) uploadImage(file,url=>update("featuredImage",url)); e.target.value=""; }}/></label>}
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-4 border-b border-slate-100 pb-4">
                <h2 className="font-semibold text-slate-800">Introduction</h2>
                <p className="mt-1 text-xs text-slate-500">Add the opening introduction that appears before the main article content.</p>
              </div>
              <label className={labelClass}>Blog introduction</label>
              <textarea
                className={inputClass}
                rows={6}
                value={form.intro}
                onChange={(e) => update("intro", e.target.value)}
                placeholder="Write a short introduction to set the context for this article..."
              />
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-5 flex flex-col justify-between gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center"><div><h2 className="font-semibold text-slate-800">Article content</h2><p className="mt-1 text-xs text-slate-500">Build the article with headings, paragraphs, images and lists.</p></div>
                <div className="flex flex-wrap gap-2">{[["heading","Heading"],["paragraph","Paragraph"],["image","Image"],["list","Bullet list"]].map(([type,label])=><button type="button" key={type} onClick={()=>addBlock(type)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-[#0D3785] hover:text-[#0D3785]">+ {label}</button>)}</div>
              </div>
              {!form.contentBlocks.length && <div className="rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-500">Your article is empty. Add a content block to start writing.</div>}
              <div className="space-y-4">{form.contentBlocks.map((block,index)=><div key={index} className="rounded-xl border border-slate-200 p-4">
                <div className="mb-3 flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wider text-[#0D3785]">{block.type} · {index+1}</span><div className="flex items-center gap-1"><button type="button" title="Move up" disabled={!index} onClick={()=>moveBlock(index,-1)} className="rounded p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30"><ChevronUp size={16}/></button><button type="button" title="Move down" disabled={index===form.contentBlocks.length-1} onClick={()=>moveBlock(index,1)} className="rounded p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30"><ChevronDown size={16}/></button><button type="button" onClick={()=>removeBlock(index)} className="rounded p-1.5 text-red-500 hover:bg-red-50"><Trash2 size={16}/></button></div></div>
                {block.type==="heading" && <div className="space-y-2"><select className={inputClass} value={block.level||2} onChange={e=>patchBlock(index,{level:Number(e.target.value)})}><option value="2">Heading 2</option><option value="3">Heading 3</option></select><input className={inputClass} value={block.text||""} onChange={e=>patchBlock(index,{text:e.target.value})} placeholder="Heading text"/></div>}
                {block.type==="paragraph" && <textarea className={inputClass} rows={5} value={block.text||""} onChange={e=>patchBlock(index,{text:e.target.value})} placeholder="Write your paragraph..."/>}
                {block.type==="image" && <div className="space-y-3"><input className={inputClass} value={block.src||""} onChange={e=>patchBlock(index,{src:e.target.value})} placeholder="Image URL or upload below"/><label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold text-slate-700"><ImagePlus size={15}/> Upload image<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" disabled={uploading} onChange={e=>{const file=e.target.files?.[0];if(file)uploadImage(file,url=>patchBlock(index,{src:url}));e.target.value="";}}/></label><input className={inputClass} value={block.alt||""} onChange={e=>patchBlock(index,{alt:e.target.value})} placeholder="Image alt text"/><input className={inputClass} value={block.caption||""} onChange={e=>patchBlock(index,{caption:e.target.value})} placeholder="Optional image caption"/>{block.src&&<img src={block.src} alt={block.alt||""} className="max-h-64 rounded-lg object-contain"/>}</div>}
                {block.type==="list" && <div className="space-y-2">{(block.items||[]).map((item,i)=><div key={i} className="flex gap-2"><input className={inputClass} value={item} onChange={e=>patchBlock(index,{items:block.items.map((v,j)=>j===i?e.target.value:v)})} placeholder={`List item ${i+1}`}/><button type="button" onClick={()=>patchBlock(index,{items:block.items.filter((_,j)=>j!==i)})} className="px-2 text-red-500"><X size={16}/></button></div>)}<button type="button" onClick={()=>patchBlock(index,{items:[...(block.items||[]),""]})} className="text-xs font-semibold text-[#0D3785]">+ Add list item</button></div>}
              </div>)}</div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <h2 className="mb-4 font-semibold text-slate-800">SEO & social sharing</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2"><label className={labelClass}>Meta title</label><input className={inputClass} value={form.metaTitle} onChange={e=>update("metaTitle",e.target.value)} placeholder="SEO title"/></div>
                <div className="md:col-span-2"><label className={labelClass}>Meta description</label><textarea className={inputClass} rows={3} value={form.metaDescription} onChange={e=>update("metaDescription",e.target.value)} placeholder="Search result description"/></div>
                <div><label className={labelClass}>Focus keyword</label><input className={inputClass} value={form.focusKeyword} onChange={e=>update("focusKeyword",e.target.value)} placeholder="Primary keyword"/></div>
                <div><label className={labelClass}>Canonical URL</label><input className={inputClass} value={form.canonicalUrl} onChange={e=>update("canonicalUrl",e.target.value)} placeholder="https://..."/></div>
                <div><label className={labelClass}>Open Graph title</label><input className={inputClass} value={form.ogTitle} onChange={e=>update("ogTitle",e.target.value)} placeholder="Social title"/></div>
                <div><label className={labelClass}>Open Graph image URL</label><input className={inputClass} value={form.ogImage} onChange={e=>update("ogImage",e.target.value)} placeholder="https://..."/></div>
                <div className="md:col-span-2"><label className={labelClass}>Open Graph description</label><textarea className={inputClass} rows={2} value={form.ogDescription} onChange={e=>update("ogDescription",e.target.value)} placeholder="Social sharing description"/></div>
              </div>
              <div className="mt-4 flex flex-wrap gap-5 text-sm text-slate-600"><label className="flex items-center gap-2"><input type="checkbox" checked={form.robotsIndex!==false} onChange={e=>update("robotsIndex",e.target.checked)}/> Index this blog</label><label className="flex items-center gap-2"><input type="checkbox" checked={form.robotsFollow!==false} onChange={e=>update("robotsFollow",e.target.checked)}/> Follow links</label></div>
            </section>
          </div>

          <aside className="space-y-5 2xl:sticky 2xl:top-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="mb-4 font-semibold text-slate-800">Publish settings</h2>
              <label className={labelClass}>Visibility</label><select className={inputClass} value={form.status} onChange={e=>update("status",e.target.value)}><option value="DRAFT">Save as draft</option><option value="PUBLISHED">Publish on website</option></select>
              <div className="mt-4 rounded-xl bg-blue-50 p-3 text-xs leading-5 text-blue-800">Published articles appear on the public blog listing and their own article page. Drafts remain hidden from visitors.</div>
              <button type="submit" disabled={saving||uploading} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0D3785] px-4 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-[#092a69] disabled:opacity-50">{saving?<Loader2 size={17} className="animate-spin"/>:<Save size={17}/>} {saving?"Saving...":form.status==="PUBLISHED"?"Publish blog":"Save draft"}</button>
              <button type="button" onClick={newBlog} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"><Plus size={16}/> Create new / clear</button>
              {editingId&&<a href={`/blogs/${form.slug}`} target="_blank" rel="noreferrer" className="mt-3 flex items-center justify-center gap-2 text-xs font-semibold text-[#0D3785]"><Eye size={15}/> Preview published page</a>}
            </section>
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between"><h2 className="font-semibold text-slate-800">All blogs</h2><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">{blogs.length}</span></div>
              <div className="relative mb-3"><Search size={15} className="absolute left-3 top-3 text-slate-400"/><input className={`${inputClass} pl-9`} value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search blogs..."/></div>
              {loading?<div className="py-8 text-center text-sm text-slate-500"><Loader2 className="mx-auto mb-2 animate-spin"/>Loading blogs...</div>:visibleBlogs.length===0?<p className="py-7 text-center text-xs text-slate-500">No blogs found. Create your first blog.</p>:<div className="max-h-[520px] space-y-2 overflow-y-auto">{visibleBlogs.map(blog=><div key={blog.id} className="rounded-xl border border-slate-100 p-3 hover:border-blue-200"><div className="flex gap-3"><button type="button" onClick={()=>editBlog(blog)} className="min-w-0 flex-1 text-left"><p className="truncate text-sm font-semibold text-slate-800">{blog.title}</p><p className="mt-1 truncate text-xs text-slate-400">/blogs/{blog.slug}</p><span className={`mt-2 inline-flex rounded-full px-2 py-1 text-[10px] font-bold ${blog.status==="PUBLISHED"?"bg-emerald-50 text-emerald-700":"bg-amber-50 text-amber-700"}`}>{blog.status}</span></button><div className="flex flex-col gap-1"><button type="button" title="Edit" onClick={()=>editBlog(blog)} className="rounded-lg p-2 text-[#0D3785] hover:bg-blue-50"><Pencil size={15}/></button><button type="button" title="Delete" onClick={()=>deleteBlog(blog)} className="rounded-lg p-2 text-red-500 hover:bg-red-50"><Trash2 size={15}/></button></div></div></div>)}</div>}
            </section>
            {uploading&&<div className="rounded-xl bg-blue-50 px-4 py-3 text-xs font-medium text-blue-800"><Loader2 size={14} className="mr-2 inline animate-spin"/>Uploading image to database...</div>}
          </aside>
        </form>
      </div>
    </div>
  );
}
