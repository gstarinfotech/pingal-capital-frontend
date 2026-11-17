import { redirect } from "next/navigation";

export default function WebsiteSettingsRoute() {
  redirect("/admin?view=settings");
}
