import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import RequestCard from "../requests/RequestCard";
import RealtimeBookings from "./RealtimeBookings";
import type { BookingWithCustomer, Cleaner } from "@/types/database";

export default async function CleanerDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  const [{ data: cleaner }, { data: pendingBookings }, { data: upcomingBookings }] =
    await Promise.all([
      supabase
        .from("cleaners")
        .select("status")
        .eq("id", user.id)
        .single<Pick<Cleaner, "id" | "status">>(),
      supabase
        .from("bookings")
        .select("*, profiles!customer_id(full_name, phone, avatar_url)")
        .eq("cleaner_id", user.id)
        .eq("status", "pending")
        .gt("response_deadline", now.toISOString())
        .order("created_at", { ascending: true })
        .returns<BookingWithCustomer[]>(),
      supabase
        .from("bookings")
        .select("*, profiles!customer_id(full_name, phone, avatar_url)")
        .eq("cleaner_id", user.id)
        .eq("status", "accepted")
        .gte("scheduled_date", todayStr)
        .order("scheduled_date", { ascending: true })
        .limit(5)
        .returns<BookingWithCustomer[]>(),
    ]);

  if (!cleaner || cleaner.status === "pending") {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="text-center">
          <div className="text-4xl mb-3">⏳</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-1">Application under review</h2>
          <p className="text-base text-gray-500">
            You&apos;ll receive an email once your application is approved.
          </p>
        </div>
      </div>
    );
  }

  if (cleaner.status === "rejected") {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="text-center">
          <div className="text-4xl mb-3">❌</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-1">Application not approved</h2>
          <p className="text-base text-gray-500">
            Please contact support for more information.
          </p>
        </div>
      </div>
    );
  }

  if (cleaner.status === "suspended") {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="text-center">
          <div className="text-4xl mb-3">🚫</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-1">Account suspended</h2>
          <p className="text-base text-gray-500">Contact support to resolve this.</p>
        </div>
      </div>
    );
  }


  return (
    <div className="max-w-3xl">
      <RealtimeBookings cleanerId={user.id} />
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Pending requests */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-500 uppercase tracking-wide">
            New requests{" "}
            {pendingBookings && pendingBookings.length > 0 && (
              <span className="ml-1.5 bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {pendingBookings.length}
              </span>
            )}
          </h2>
          <Link href="/cleaner/requests" className="text-xs text-blue-600 hover:underline">
            View all
          </Link>
        </div>

        {pendingBookings && pendingBookings.length > 0 ? (
          <div className="space-y-3">
            {pendingBookings.map((b) => (
              <RequestCard key={b.id} booking={b} showActions />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 py-8 text-center text-gray-400 text-base">
            No pending requests right now.
          </div>
        )}
      </section>

      {/* Upcoming jobs */}
      <section>
        <h2 className="text-base font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Upcoming jobs
        </h2>

        {upcomingBookings && upcomingBookings.length > 0 ? (
          <div className="space-y-3">
            {upcomingBookings.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between"
              >
                <div>
                  <div className="font-medium text-base text-gray-900">
                    {b.profiles?.full_name ?? "Customer"}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{b.address}</div>
                </div>
                <div className="text-right">
                  <div className="text-base font-medium text-gray-900">{b.scheduled_date}</div>
                  <div className="text-xs text-gray-500">
                    {b.scheduled_start?.slice(0, 5)} · {b.duration_hours}h
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 py-8 text-center text-gray-400 text-base">
            No upcoming jobs.
          </div>
        )}
      </section>
    </div>
  );
}
