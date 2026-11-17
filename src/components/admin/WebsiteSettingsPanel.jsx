"use client";

import { useEffect, useState } from "react";
import { Save, CheckCircle2, AlertCircle, Code2 } from "lucide-react";

const empty = { headCode: "", bodyStartCode: "", bodyEndCode: "" };
const editorClass = "w-full rounded-lg border border-gray-200 bg-[#0f172a] px-4 py-3 font-mono text-xs leading-6 text-green-200 outline-none focus:border-blue-400";
const labelClass = "mb-2 block text-sm font-semibold text-gray-700";

export default function WebsiteSettingsPanel() {
  const [settings, setSettings] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/site-settings", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Unable to load website settings.");
        setSettings({ ...empty, ...(result.settings || {}) });
      })
      .catch((err) => setError(err.message || "Unable to load website settings."))
      .finally(() => setLoading(false));
  }, []);

  function update(key, value) {
    setSettings((current) => ({ ...current, [key]: value }));
    setNotice(""); setError("");
  }

  async function save(event) {
    event.preventDefault();
    setSaving(true); setNotice(""); setError("");
    try {
      const response = await fetch("/api/site-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to save website settings.");
      setSettings({ ...empty, ...(result.settings || {}) });
      setNotice("Website code settings saved. New code will be injected on public pages without a redeploy.");
    } catch (err) { setError(err.message || "Unable to save website settings."); }
    finally { setSaving(false); }
  }

  return (
    <div className="w-full px-6 py-8 lg:px-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Website Settings</p>
        <h2 className="mt-1 font-playfair text-3xl font-bold text-[#0B2E6F]">Google Analytics &amp; Tracking Codes</h2>
        <p className="mt-1 text-sm text-gray-500">Manage the same Head, Body Start and Body End code areas as the Gstar admin.</p>
      </div>
      {notice && <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700"><CheckCircle2 size={17}/>{notice}</div>}
      {error && <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"><AlertCircle size={17}/>{error}</div>}
      <form onSubmit={save} className="max-w-5xl space-y-5">
        {[
          ["headCode", "Head Code", "Code placed inside the document head. Paste Google tag / GA4, Google Search Console verification, Meta verification or other trusted provider snippets here.", 10],
          ["bodyStartCode", "Body Start Code", "Code placed immediately after the opening body tag. Commonly used for Google Tag Manager noscript iframe.", 7],
          ["bodyEndCode", "Body End Code", "Code placed near the end of the body, before the page finishes.", 7],
        ].map(([key, label, help, rows]) => (
          <section key={key} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <label className={labelClass} htmlFor={key}><span className="inline-flex items-center gap-2"><Code2 size={16} className="text-[#0B2E6F]"/>{label}</span></label>
            <textarea id={key} rows={rows} spellCheck={false} className={editorClass} value={settings[key]} onChange={(e) => update(key, e.target.value)} placeholder={`Paste ${label.toLowerCase()} snippet here...`} disabled={loading}/>
            <p className="mt-2 text-xs leading-5 text-gray-500">{help}</p>
          </section>
        ))}
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-800">
          Only paste scripts and tags from providers you trust. These snippets run on every public page and can affect site security, performance and visitor privacy. Do not paste unverified code.
        </div>
        <button type="submit" disabled={loading || saving} className="inline-flex items-center gap-2 rounded-lg bg-[#0B2E6F] px-5 py-3 text-sm font-semibold text-white hover:bg-[#123d88] disabled:opacity-50">
          <Save size={16}/>{loading ? "Loading..." : saving ? "Saving..." : "Save Website Settings"}
        </button>
      </form>
    </div>
  );
}
