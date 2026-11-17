import { NextResponse } from "next/server";
import { getSiteSettings, saveSiteSettings } from "@/lib/admin-settings";

export const dynamic = "force-dynamic";

export async function GET(request) {
    try {
        return NextResponse.json({ settings: await getSiteSettings() });
    } catch (error) {
        console.error("Site settings GET failed:", error);
        return NextResponse.json({ error: "Unable to load site settings" }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const body = await request.json();
        const currentSettings = await getSiteSettings();
        const settings = {
            // Preserve the legacy GA4 ID unless the request explicitly changes it.
            googleAnalyticsId: String(body.googleAnalyticsId !== undefined ? body.googleAnalyticsId : (currentSettings.googleAnalyticsId || "")).trim().slice(0, 80),
            headCode: String(body.headCode || "").slice(0, 50000),
            bodyStartCode: String(body.bodyStartCode || "").slice(0, 50000),
            bodyEndCode: String(body.bodyEndCode || "").slice(0, 50000),
        };
        if (settings.googleAnalyticsId && !/^G-[A-Z0-9]+$/i.test(settings.googleAnalyticsId)) {
            return NextResponse.json({ error: "Enter a valid Google Analytics Measurement ID (G-XXXXXXXXXX)." }, { status: 400 });
        }
        await saveSiteSettings(settings);
        return NextResponse.json({ success: true, settings });
    } catch (error) {
        console.error("Site settings PUT failed:", error);
        return NextResponse.json({ error: "Unable to save site settings" }, { status: 500 });
    }
}
