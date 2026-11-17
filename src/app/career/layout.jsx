import { applySeoMetadata } from "@/lib/admin-settings";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
    return applySeoMetadata("/career", {});
}

export default function PageLayout({ children }) {
    return children;
}
