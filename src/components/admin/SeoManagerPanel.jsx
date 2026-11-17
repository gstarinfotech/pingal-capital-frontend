"use client";

import { useEffect, useMemo, useState } from "react";
import { Save, Search, CheckCircle2, AlertCircle } from "lucide-react";

const pages = [
  { path: "/", label: "Home Page" },
  { path: "/about", label: "About" },
  { path: "/career", label: "Career" },
  { path: "/contact", label: "Contact" },
  { path: "/join-us", label: "Join Us" },
  { path: "/our-partners", label: "Our Partners" },
  { path: "/services/home-loan", label: "Home Loan" },
  { path: "/services/loan-services-for-nris", label: "NRI Loan" },
  { path: "/services/loan-against-property", label: "Loan Against Property" },
  { path: "/services/balance-transfer-and-top-up", label: "Balance Transfer & Top-Up" },
  { path: "/services/non-residential-premises-loan", label: "Non-Residential Premises" },
  { path: "/services/loan-against-rentals", label: "Loan Against Rentals" },
  { path: "/services/debt-consolidation", label: "Debt Consolidation" },
  { path: "/services/overdraft-facility", label: "Overdraft Facility" },
  { path: "/services/working-capital", label: "Working Capital" },
  { path: "/services/business-loan", label: "Business Loan" },
  { path: "/services/personal-loan", label: "Personal Loan" },
  { path: "/services/cgtmse", label: "CGTMSE" },
];

const emptySeo = {
  title: "", description: "", keywords: "", canonicalUrl: "",
  index: true, follow: true, ogTitle: "", ogDescription: "", ogImage: "",
};

const inputClass = "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#0B2E6F] focus:ring-2 focus:ring-blue-100";
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500";

function Field({ label, value, onChange, multiline = false, rows = 3, placeholder = "" }) {
  const common = { value, onChange: (e) => onChange(e.target.value), placeholder, className: inputClass };
  return <label className="block"><span className={labelClass}>{label}</span>{multiline ? <textarea {...common} rows={rows}/> : <input {...common}/>}</label>;
}

export default function SeoManagerPanel() {
  const [path, setPath] = useState("/");
  const [seo, setSeo] = useState(emptySeo);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const filteredPages = useMemo(() => pages.filter((p) =>
    `${p.label} ${p.path}`.toLowerCase().includes(search.toLowerCase())
  ), [search]);

  async function loadPage(nextPath) {
    setLoading(true); setNotice(""); setError("");
    try {
      const response = await fetch(`/api/seo?path=${encodeURIComponent(nextPath)}`, { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to load SEO settings.");
      setSeo({ ...emptySeo, ...(result.settings || {}) });
    } catch (err) {
      setError(err.message || "Unable to load SEO settings.");
      setSeo(emptySeo);
    } finally { setLoading(false); }
  }

  useEffect(() => { loadPage("/"); }, []);

  async function save(event) {
    event.preventDefault(); setSaving(true); setNotice(""); setError("");
    try {
      const response = await fetch("/api/seo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path, settings: seo }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to save SEO settings.");
      setSeo({ ...emptySeo, ...(result.settings || {}) });
      setNotice("SEO settings saved. The public page metadata will use these values immediately.");
    } catch (err) { setError(err.message || "Unable to save SEO settings."); }
    finally { setSaving(false); }
  }

  const update = (key, value) => setSeo((old) => ({ ...old, [key]: value }));

  return (
    <div className="w-full px-6 py-8 lg:px-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Website Settings</p>
          <h2 className="mt-1 font-playfair text-3xl font-bold text-[#0B2E6F]">SEO Management</h2>
          <p className="mt-1 text-sm text-gray-500">Manage search and social metadata separately for every public website page.</p>
        </div>
        <button onClick={save} disabled={saving || loading} className="inline-flex items-center gap-2 rounded-lg bg-[#0B2E6F] px-5 py-3 text-sm font-semibold text-white hover:bg-[#123d88] disabled:opacity-50">
          <Save size={16}/>{saving ? "Saving..." : "Save SEO Settings"}
        </button>
      </div>

      {notice && <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700"><CheckCircle2 size={17}/>{notice}</div>}
      {error && <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"><AlertCircle size={17}/>{error}</div>}

      <div className="grid items-start gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="border-b p-4">
            <h3 className="font-semibold text-gray-800">Website Pages</h3>
            <p className="mt-1 text-xs text-gray-500">{pages.length} pages available</p>
            <div className="relative mt-3"><Search size={15} className="absolute left-3 top-3 text-gray-400"/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search page or URL" className={`${inputClass} pl-9`}/></div>
          </div>
          <div className="max-h-[65vh] overflow-y-auto p-2">
            {filteredPages.map((item) => <button key={item.path} type="button" onClick={() => { setPath(item.path); loadPage(item.path); }} className={`mb-1 w-full rounded-lg border px-3 py-2.5 text-left ${path === item.path ? "border-blue-200 bg-blue-50 text-[#0B2E6F]" : "border-transparent text-gray-600 hover:bg-gray-50"}`}>
              <span className="block text-sm font-medium">{item.label}</span><span className="mt-0.5 block truncate text-xs text-gray-400">{item.path}</span>
            </button>)}
            {!filteredPages.length && <p className="p-3 text-sm text-gray-400">No pages found.</p>}
          </div>
        </aside>

        {loading ? <div className="rounded-xl border bg-white p-8 text-sm text-gray-400">Loading SEO settings...</div> : <form onSubmit={save} className="grid gap-5 2xl:grid-cols-2">
          <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-5">
            <div><h3 className="font-playfair text-xl font-bold text-[#0B2E6F]">Search Engine Metadata</h3><p className="mt-1 text-xs text-gray-400">Search result title, description and crawl directives.</p></div>
            <Field label="Meta Title" value={seo.title} onChange={(v) => update("title", v)} placeholder="Page title"/>
            <Field label="Meta Description" value={seo.description} onChange={(v) => update("description", v)} multiline rows={4} placeholder="Describe this page for search results"/>
            <Field label="Focus Keyword / Keywords" value={seo.keywords} onChange={(v) => update("keywords", v)} placeholder="Primary keyword, secondary keyword"/>
            <Field label="Canonical URL" value={seo.canonicalUrl} onChange={(v) => update("canonicalUrl", v)} placeholder={`https://www.pingalcapital.com${path}`}/>
            <div className="flex flex-wrap gap-6 border-t pt-4">
              <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={seo.index} onChange={(e) => update("index", e.target.checked)} className="accent-[#0B2E6F]"/> Allow indexing</label>
              <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={seo.follow} onChange={(e) => update("follow", e.target.checked)} className="accent-[#0B2E6F]"/> Allow link following</label>
            </div>
          </section>
          <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-5">
            <div><h3 className="font-playfair text-xl font-bold text-[#0B2E6F]">Social Sharing / Open Graph</h3><p className="mt-1 text-xs text-gray-400">Controls how this page appears when shared.</p></div>
            <Field label="OG Title" value={seo.ogTitle} onChange={(v) => update("ogTitle", v)} placeholder="Social sharing title"/>
            <Field label="OG Description" value={seo.ogDescription} onChange={(v) => update("ogDescription", v)} multiline rows={4} placeholder="Social sharing description"/>
            <Field label="OG Image URL" value={seo.ogImage} onChange={(v) => update("ogImage", v)} placeholder="https://.../social-preview.jpg"/>
            <div className="rounded-lg bg-blue-50 p-4 text-xs leading-5 text-blue-800">Use a share image around 1200 × 630 px. Save to update the public page's Open Graph and Twitter metadata.</div>
          </section>
        </form>}
      </div>
    </div>
  );
}
