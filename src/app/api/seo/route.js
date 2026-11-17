import { NextResponse } from "next/server";
import { getAllSeoSettings, getSeoSettings, saveSeoSettings } from "@/lib/admin-settings";

export const dynamic = "force-dynamic";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const pathname = searchParams.get("path");
        if (pathname) {
            return NextResponse.json({ settings: await getSeoSettings(pathname) || {} });
        }
        return NextResponse.json({ settings: await getAllSeoSettings() });
    } catch (error) {
        console.error("SEO settings GET failed:", error);
        return NextResponse.json({ error: "Unable to load SEO settings" }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const { path: pathname, settings } = await request.json();
        if (typeof pathname !== "string" || !pathname.startsWith("/") || !settings || typeof settings !== "object") {
            return NextResponse.json({ error: "Valid path and settings are required" }, { status: 400 });
        }
        const allowed = {
            title: String(settings.title || "").slice(0, 300),
            description: String(settings.description || "").slice(0, 1000),
            keywords: String(settings.keywords || "").slice(0, 2000),
            canonicalUrl: String(settings.canonicalUrl || "").slice(0, 1000),
            index: settings.index !== false,
            follow: settings.follow !== false,
            ogTitle: String(settings.ogTitle || "").slice(0, 300),
            ogDescription: String(settings.ogDescription || "").slice(0, 1000),
            ogImage: String(settings.ogImage || "").slice(0, 2000),
        };
        await saveSeoSettings(pathname, allowed);
        return NextResponse.json({ success: true, settings: allowed });
    } catch (error) {
        console.error("SEO settings PUT failed:", error);
        return NextResponse.json({ error: "Unable to save SEO settings" }, { status: 500 });
    }
}
