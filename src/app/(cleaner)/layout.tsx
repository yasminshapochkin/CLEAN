import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { signOut } from "@/app/(auth)/actions";
import type { Profile, Cleaner } from "@/types/database";

const navLinks = [
  { href: "/cleaner/dashboard", label: "Dashboard" },
  { href: "/cleaner/requests", label: "Requests" },
  { href: "/cleaner/availability", label: "Availability" },
  { href: "/cleaner/profile", label: "Profile" },
];

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
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-5 py-5 border-b border-gray-100">
          <span className="text-lg font-bold text-blue-600">Clean</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-gray-100 space-y-2">
          <div className="text-sm font-medium text-gray-900 truncate">
            {profile.full_name ?? user.email}
          </div>
          {cleaner && (
            <span
              className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
                statusColor[cleaner.status] ?? "bg-gray-100 text-gray-600"
              }`}
            >
              {cleaner.status}
            </span>
          )}
          <form action={signOut}>
            <button
              type="submit"
              className="w-full text-left text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
