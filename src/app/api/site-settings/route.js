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
        const settings = {
            googleAnalyticsId: String(body.googleAnalyticsId || "").trim().slice(0, 80),
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
