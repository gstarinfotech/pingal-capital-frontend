
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Search, LogOut, BarChart3, LayoutDashboard, FileText, Edit3 } from "lucide-react";

const pages = [
    {
        "path": "/",
        "label": "Home Page"
    },
    {
        "path": "/about",
        "label": "About"
    },
    {
        "path": "/career",
        "label": "Career"
    },
    {
        "path": "/contact",
        "label": "Contact"
    },
    {
        "path": "/join-us",
        "label": "Join Us"
    },
    {
        "path": "/our-partners",
        "label": "Our Partners"
    },
    {
        "path": "/services/home-loan",
        "label": "Home Loan"
    },
    {
        "path": "/services/loan-services-for-nris",
        "label": "NRI Loan"
    },
    {
        "path": "/services/loan-against-property",
        "label": "Loan Against Property"
    },
    {
        "path": "/services/balance-transfer-and-top-up",
        "label": "Balance Transfer & Top-Up"
    },
    {
        "path": "/services/non-residential-premises-loan",
        "label": "Non-Residential Premises"
    },
    {
        "path": "/services/loan-against-rentals",
        "label": "Loan Against Rentals"
    },
    {
        "path": "/services/debt-consolidation",
        "label": "Debt Consolidation"
    },
    {
        "path": "/services/overdraft-facility",
        "label": "Overdraft Facility"
    },
    {
        "path": "/services/working-capital",
        "label": "Working Capital"
    },
    {
        "path": "/services/business-loan",
        "label": "Business Loan"
    },
    {
        "path": "/services/personal-loan",
        "label": "Personal Loan"
    },
    {
        "path": "/services/cgtmse",
        "label": "CGTMSE"
    }
];
const emptySeo = {
    title: "",
    description: "",
    keywords: "",
    canonicalUrl: "",
    index: true,
    follow: true,
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
};

export default function SeoManagerPage() {
    const router = useRouter();
    const [selectedPath, setSelectedPath] = useState("/");
    const [seo, setSeo] = useState(emptySeo);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notice, setNotice] = useState("");

    useEffect(() => {
        if (sessionStorage.getItem("admin_auth") !== "true") {
            router.push("/admin/login");
            return;
        }
        loadSeo("/");
    }, []);

    async function loadSeo(path) {
        setLoading(true);
        setNotice("");
        try {
            const response = await fetch(`/api/seo?path=${encodeURIComponent(path)}`, { cache: "no-store" });
            const result = await response.json();
            setSeo({ ...emptySeo, ...(result.settings || {}) });
        } catch {
            setNotice("Unable to load SEO settings.");
            setSeo(emptySeo);
        } finally {
            setLoading(false);
        }
    }

    function handlePageChange(path) {
        setSelectedPath(path);
        loadSeo(path);
    }

    async function handleSave() {
        setSaving(true);
        setNotice("");
        try {
            const response = await fetch("/api/seo", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ path: selectedPath, settings: seo }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || "Unable to save SEO settings.");
            setNotice("SEO settings saved successfully.");
        } catch (error) {
            setNotice(error.message || "Unable to save SEO settings.");
        } finally {
            setSaving(false);
        }
    }

    function update(key, value) {
        setSeo((current) => ({ ...current, [key]: value }));
    }

    async function logout() {
        sessionStorage.removeItem("admin_auth");
        await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
        router.push("/admin/login");
    }

    const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
    const labelClass = "mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500";

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800">
            <aside className="fixed inset-y-0 left-0 z-20 flex w-60 flex-col bg-[#0B2E6F] text-white">
                <div className="border-b border-white/10 px-6 py-7">
                    <div className="font-playfair text-lg font-bold">Pingal Capital</div>
                    <div className="mt-1 text-xs text-blue-200">Admin Panel</div>
                </div>
                <nav className="flex-1 space-y-1 px-4 py-6 text-sm">
                    <Link href="/admin" className="flex items-center gap-3 rounded-xl px-4 py-3 text-white/75 hover:bg-white/10"><LayoutDashboard size={17}/> Dashboard</Link>
                    <Link href="/admin/submissions" className="flex items-center gap-3 rounded-xl px-4 py-3 text-white/75 hover:bg-white/10"><FileText size={17}/> Submissions</Link>
                    <Link href="/admin/content" className="flex items-center gap-3 rounded-xl px-4 py-3 text-white/75 hover:bg-white/10"><Edit3 size={17}/> Content Editor</Link>
                    <Link href="/admin/seo" className="flex items-center gap-3 rounded-xl bg-white/15 px-4 py-3 font-semibold"><Search size={17}/> SEO Manager</Link>
                    <Link href="/admin/settings" className="flex items-center gap-3 rounded-xl px-4 py-3 text-white/75 hover:bg-white/10"><BarChart3 size={17}/> Google Analytics</Link>
                </nav>
                <button onClick={logout} className="flex items-center gap-3 border-t border-white/10 px-8 py-5 text-left text-sm text-white/75 hover:bg-white/10"><LogOut size={17}/> Logout</button>
            </aside>

            <main className="ml-60 p-8 lg:p-10">
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400"><ArrowLeft size={14}/><Link href="/admin" className="hover:text-[#0B2E6F]">Admin</Link><span>/</span>SEO Manager</div>
                        <h1 className="font-playfair text-3xl font-bold text-[#0B2E6F]">SEO Management</h1>
                        <p className="mt-1 text-sm text-slate-500">Manage search and social metadata separately for every website page.</p>
                    </div>
                    <button onClick={handleSave} disabled={saving || loading} className="flex items-center gap-2 rounded-xl bg-[#0B2E6F] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#123d88] disabled:opacity-50"><Save size={16}/>{saving ? "Saving..." : "Save SEO Settings"}</button>
                </div>

                <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <label className={labelClass}>Select website page</label>
                    <select value={selectedPath} onChange={(e) => handlePageChange(e.target.value)} className={`${inputClass} max-w-xl`}>
                        {pages.map((page) => <option key={page.path} value={page.path}>{page.label} — {page.path}</option>)}
                    </select>
                </div>

                {notice && <div className={`mb-5 rounded-xl px-4 py-3 text-sm ${notice.includes("successfully") ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>{notice}</div>}

                {loading ? <div className="rounded-2xl bg-white p-8 text-sm text-slate-400">Loading SEO settings...</div> : (
                    <div className="grid gap-6 xl:grid-cols-2">
                        <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div><h2 className="font-playfair text-xl font-bold text-[#0B2E6F]">Search Engine Metadata</h2><p className="mt-1 text-xs text-slate-400">Shown in search results and used by search engines.</p></div>
                            <div><label className={labelClass}>Meta Title</label><input className={inputClass} value={seo.title} onChange={(e) => update("title", e.target.value)} placeholder="Page title"/></div>
                            <div><label className={labelClass}>Meta Description</label><textarea className={inputClass} rows={4} value={seo.description} onChange={(e) => update("description", e.target.value)} placeholder="Short page description"/></div>
                            <div><label className={labelClass}>Meta Keywords</label><textarea className={inputClass} rows={3} value={seo.keywords} onChange={(e) => update("keywords", e.target.value)} placeholder="keyword one, keyword two, keyword three"/></div>
                            <div><label className={labelClass}>Canonical URL</label><input className={inputClass} value={seo.canonicalUrl} onChange={(e) => update("canonicalUrl", e.target.value)} placeholder="https://www.pingalcapital.com/..."/></div>
                            <div className="flex flex-wrap gap-6 border-t border-slate-100 pt-4">
                                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={seo.index} onChange={(e) => update("index", e.target.checked)} className="h-4 w-4 accent-[#0B2E6F]"/> Allow indexing (index)</label>
                                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={seo.follow} onChange={(e) => update("follow", e.target.checked)} className="h-4 w-4 accent-[#0B2E6F]"/> Allow link following (follow)</label>
                            </div>
                        </section>
                        <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div><h2 className="font-playfair text-xl font-bold text-[#0B2E6F]">Social Sharing / Open Graph</h2><p className="mt-1 text-xs text-slate-400">Controls the preview when this page is shared.</p></div>
                            <div><label className={labelClass}>OG Title</label><input className={inputClass} value={seo.ogTitle} onChange={(e) => update("ogTitle", e.target.value)} placeholder="Social sharing title"/></div>
                            <div><label className={labelClass}>OG Description</label><textarea className={inputClass} rows={4} value={seo.ogDescription} onChange={(e) => update("ogDescription", e.target.value)} placeholder="Social sharing description"/></div>
                            <div><label className={labelClass}>OG Image URL</label><input className={inputClass} value={seo.ogImage} onChange={(e) => update("ogImage", e.target.value)} placeholder="https://.../social-preview.jpg"/></div>
                            <div className="rounded-xl bg-blue-50 p-4 text-xs leading-5 text-blue-800">Tip: Use a share image around 1200 × 630 px. Leave fields blank to use the page's default metadata where available.</div>
                        </section>
                    </div>
                )}
            </main>
        </div>
    );
}
