import pool from "@/lib/db";

async function ensureTables() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS pingal_seo_settings (
            path TEXT PRIMARY KEY,
            settings JSONB NOT NULL DEFAULT '{}'::jsonb,
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS pingal_site_settings (
            setting_key TEXT PRIMARY KEY,
            settings JSONB NOT NULL DEFAULT '{}'::jsonb,
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);
}

export async function getSeoSettings(pathname) {
    try {
        await ensureTables();
        const result = await pool.query(
            "SELECT settings FROM pingal_seo_settings WHERE path = $1 LIMIT 1",
            [pathname]
        );
        return result.rows[0]?.settings || null;
    } catch (error) {
        console.error("Unable to load Pingal SEO settings:", error.message);
        return null;
    }
}

export async function getAllSeoSettings() {
    await ensureTables();
    const result = await pool.query(
        "SELECT path, settings FROM pingal_seo_settings ORDER BY path"
    );
    return Object.fromEntries(result.rows.map((row) => [row.path, row.settings]));
}

export async function saveSeoSettings(pathname, settings) {
    await ensureTables();
    await pool.query(
        `INSERT INTO pingal_seo_settings (path, settings, updated_at)
         VALUES ($1, $2::jsonb, NOW())
         ON CONFLICT (path)
         DO UPDATE SET settings = EXCLUDED.settings, updated_at = NOW()`,
        [pathname, JSON.stringify(settings)]
    );
    return settings;
}

export async function getSiteSettings() {
    try {
        await ensureTables();
        const result = await pool.query(
            "SELECT settings FROM pingal_site_settings WHERE setting_key = 'global' LIMIT 1"
        );
        return result.rows[0]?.settings || {
            googleAnalyticsId: "",
            headCode: "",
            bodyStartCode: "",
            bodyEndCode: "",
        };
    } catch (error) {
        console.error("Unable to load Pingal site settings:", error.message);
        return { googleAnalyticsId: "" };
    }
}

export async function saveSiteSettings(settings) {
    await ensureTables();
    await pool.query(
        `INSERT INTO pingal_site_settings (setting_key, settings, updated_at)
         VALUES ('global', $1::jsonb, NOW())
         ON CONFLICT (setting_key)
         DO UPDATE SET settings = EXCLUDED.settings, updated_at = NOW()`,
        [JSON.stringify(settings)]
    );
    return settings;
}

export async function applySeoMetadata(pathname, fallback = {}) {
    const seo = await getSeoSettings(pathname);
    if (!seo) return fallback;

    const metadata = { ...fallback };
    if (seo.title) metadata.title = seo.title;
    if (seo.description) metadata.description = seo.description;
    if (seo.keywords) {
        metadata.keywords = String(seo.keywords)
            .split(",")
            .map((keyword) => keyword.trim())
            .filter(Boolean);
    }
    metadata.alternates = {
        ...(metadata.alternates || {}),
        canonical: seo.canonicalUrl || `https://www.pingalcapital.com${pathname}`,
    };

    metadata.robots = {
        index: seo.index !== false,
        follow: seo.follow !== false,
        googleBot: {
            index: seo.index !== false,
            follow: seo.follow !== false,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
        },
    };

    const ogTitle = seo.ogTitle || seo.title || fallback.title;
    const ogDescription = seo.ogDescription || seo.description || fallback.description;
    metadata.openGraph = {
        ...(metadata.openGraph || {}),
        type: "website",
        title: ogTitle,
        description: ogDescription,
        url: seo.canonicalUrl || metadata.openGraph?.url,
        images: seo.ogImage ? [{ url: seo.ogImage }] : metadata.openGraph?.images,
    };
    metadata.twitter = {
        ...(metadata.twitter || {}),
        card: "summary_large_image",
        title: ogTitle,
        description: ogDescription,
        images: seo.ogImage ? [seo.ogImage] : metadata.twitter?.images,
    };
    return metadata;
}
