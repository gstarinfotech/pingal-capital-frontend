import { redirect } from "next/navigation";

export default function SeoRoute() {
  redirect("/admin?view=seo");
}
