import { applySeoMetadata } from "@/lib/admin-settings";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
    const { pageName } = await params;
    return applySeoMetadata(`/services/${pageName}`, {});
}

export default function ServicePageLayout({ children }) {
    return children;
}
