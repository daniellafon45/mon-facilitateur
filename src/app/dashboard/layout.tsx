import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardHydrator } from "@/components/dashboard/dashboard-hydrator";
import { DashboardClientLayout } from "@/components/dashboard/dashboard-client-layout";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarded")
    .eq("id", user.id)
    .single();

  if (profile && !profile.onboarded) redirect("/onboarding");

  return (
    <>
      <DashboardHydrator />
      <DashboardClientLayout>{children}</DashboardClientLayout>
    </>
  );
}
