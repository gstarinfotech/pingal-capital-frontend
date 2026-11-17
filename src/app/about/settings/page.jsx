"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, BarChart3, LayoutDashboard, FileText, Edit3, Search, LogOut, Info } from "lucide-react";

export default function AnalyticsSettingsPage() {
    const router = useRouter();
    const [googleAnalyticsId, setGoogleAnalyticsId] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notice, setNotice] = useState("");

    useEffect(() => {
        if (sessionStorage.getItem("admin_auth") !== "true") {
            router.push("/admin/login");
            return;
        }
        fetch("/api/site-settings", { cache: "no-store" })
            .then(async (response) => {
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || "Unable to load settings.");
                setGoogleAnalyticsId(data.settings?.googleAnalyticsId || "");
            })
            .catch((error) => setNotice(error.message))
            .finally(() => setLoading(false));
    }, []);

    async function handleSave() {
        setSaving(true);
        setNotice("");
        try {
            const response = await fetch("/api/site-settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ googleAnalyticsId }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || "Unable to save settings.");
            setNotice("Google Analytics settings saved. The tracking tag is now active on the website.");
        } catch (error) {
            setNotice(error.message);
        } finally {
            setSaving(false);
        }
    }

    async function logout() {
        sessionStorage.removeItem("admin_auth");
        await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
        router.push("/admin/login");
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800">
            <aside className="fixed inset-y-0 left-0 z-20 flex w-60 flex-col bg-[#0B2E6F] text-white">
                <div className="border-b border-white/10 px-6 py-7"><div className="font-playfair text-lg font-bold">Pingal Capital</div><div className="mt-1 text-xs text-blue-200">Admin Panel</div></div>
                <nav className="flex-1 space-y-1 px-4 py-6 text-sm">
                    <Link href="/admin" className="flex items-center gap-3 rounded-xl px-4 py-3 text-white/75 hover:bg-white/10"><LayoutDashboard size={17}/> Dashboard</Link>
                    <Link href="/admin/submissions" className="flex items-center gap-3 rounded-xl px-4 py-3 text-white/75 hover:bg-white/10"><FileText size={17}/> Submissions</Link>
                    <Link href="/admin/content" className="flex items-center gap-3 rounded-xl px-4 py-3 text-white/75 hover:bg-white/10"><Edit3 size={17}/> Content Editor</Link>
                    <Link href="/admin/seo" className="flex items-center gap-3 rounded-xl px-4 py-3 text-white/75 hover:bg-white/10"><Search size={17}/> SEO Manager</Link>
                    <Link href="/admin/settings" className="flex items-center gap-3 rounded-xl bg-white/15 px-4 py-3 font-semibold"><BarChart3 size={17}/> Google Analytics</Link>
                </nav>
                <button onClick={logout} className="flex items-center gap-3 border-t border-white/10 px-8 py-5 text-left text-sm text-white/75 hover:bg-white/10"><LogOut size={17}/> Logout</button>
            </aside>
            <main className="ml-60 p-8 lg:p-10">
                <div className="mb-8">
                    <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400"><ArrowLeft size={14}/><Link href="/admin" className="hover:text-[#0B2E6F]">Admin</Link><span>/</span>Google Analytics</div>
                    <h1 className="font-playfair text-3xl font-bold text-[#0B2E6F]">Google Analytics</h1>
                    <p className="mt-1 text-sm text-slate-500">Connect Pingal Capital to its own Google Analytics 4 property.</p>
                </div>
                {notice && <div className={`mb-5 rounded-xl px-4 py-3 text-sm ${notice.includes("saved") ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>{notice}</div>}
                <section className="max-w-3xl rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
                    <div className="mb-6 flex items-start gap-3 rounded-xl bg-blue-50 p-4 text-sm text-blue-800"><Info className="mt-0.5 shrink-0" size={18}/><p>Enter the Google Analytics 4 Measurement ID for Pingal Capital. It usually looks like <strong>G-XXXXXXXXXX</strong>. Do not use Gstar Infotech's measurement ID; each website should use its own Analytics property.</p></div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">GA4 Measurement ID</label>
                    <input value={googleAnalyticsId} onChange={(e) => setGoogleAnalyticsId(e.target.value.toUpperCase())} disabled={loading} placeholder="G-XXXXXXXXXX" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"/>
                    <p className="mt-2 text-xs text-slate-400">Leave empty to disable Google Analytics tracking.</p>
                    <div className="mt-7 flex justify-end">
                        <button onClick={handleSave} disabled={saving || loading} className="flex items-center gap-2 rounded-xl bg-[#0B2E6F] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#123d88] disabled:opacity-50"><Save size={16}/>{saving ? "Saving..." : "Save Settings"}</button>
                    </div>
                </section>
            </main>
        </div>
    );
}
