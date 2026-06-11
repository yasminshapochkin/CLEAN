import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import RequestCard from "./RequestCard";
import type { BookingWithCustomer } from "@/types/database";

export default async function RequestsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, profiles!customer_id(full_name, phone, avatar_url)")
    .eq("cleaner_id", user.id)
    .order("created_at", { ascending: false })
    .returns<BookingWithCustomer[]>();

  const now = new Date();
  const pending = (bookings ?? []).filter(
    (b) => b.status === "pending" && new Date(b.response_deadline) > now
  );
  const past = (bookings ?? []).filter(
    (b) => b.status !== "pending" || new Date(b.response_deadline) <= now
  );

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Requests</h1>
      <p className="text-sm text-gray-500 mb-6">
        Respond to pending requests within 24 hours.
      </p>

      {pending.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Awaiting response ({pending.length})
          </h2>
          <div className="space-y-3">
            {pending.map((b) => (
              <RequestCard key={b.id} booking={b} showActions />
            ))}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Past requests
          </h2>
          <div className="space-y-3">
            {past.map((b) => (
              <RequestCard key={b.id} booking={b} showActions={false} />
            ))}
          </div>
        </section>
      )}

      {(!bookings || bookings.length === 0) && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">📬</div>
          <p className="text-sm">No booking requests yet.</p>
        </div>
      )}
    </div>
  );
}
