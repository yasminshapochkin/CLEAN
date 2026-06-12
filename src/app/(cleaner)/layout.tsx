import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { signOut } from "@/app/(auth)/actions";
import NavLinks from "./NavLinks";
import type { Profile, Cleaner } from "@/types/database";

export default async function CleanerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  if (!profile || profile.role !== "cleaner") redirect("/login");

  const { data: cleaner } = await supabase
    .from("cleaners")
    .select("status")
    .eq("id", user.id)
    .single<Pick<Cleaner, "id" | "status">>();

  const statusColor: Record<string, string> = {
    approved: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    rejected: "bg-red-100 text-red-700",
    suspended: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      <NavLinks
        signOut={signOut}
        userName={profile.full_name ?? user.email ?? ""}
        status={cleaner?.status ?? null}
        statusColor={statusColor[cleaner?.status ?? ""] ?? "bg-gray-100 text-gray-600"}
      />
      {/* pt-14 on mobile to clear the fixed top bar */}
      <main className="relative flex-1 p-8 pt-20 lg:pt-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
