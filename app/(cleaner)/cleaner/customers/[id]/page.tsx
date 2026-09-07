import { getCurrentUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect, notFound } from "next/navigation";
import type { Profile, Booking, Customer } from "@/types/database";
import BackLink from "./BackLink";
import DateCube from "./DateCube";
import HostProfileCard from "@/components/HostProfileCard";
import type { ReviewItem } from "@/components/HostProfileReviews";

const STATUS_STYLES: Record<string, string> = {
  pending:   "bg-yellow-100 text-yellow-700",
  accepted:  "bg-green-100 text-green-700",
  declined:  "bg-red-100 text-red-700",
  completed: "bg-blue-100 text-blue-700",
  cancelled: "bg-gray-100 text-gray-500",
};

export default async function CustomerProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { id } = await params;
  const { from } = await searchParams;
  const fromDashboard = from === "dashboard";
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Service-role client: the "users manage own profile" RLS policy hides the
  // customer's profile row from the cleaner. Authorization is still enforced
  // below — the page 404s unless this cleaner has a booking with this customer.
  const supabase = createAdminClient();

  const [{ data: profile }, { data: customer }, { data: bookings }, { data: reviewRows }] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single<Profile>(),
    supabase
      .from("customers")
      .select("*")
      .eq("id", id)
      .single<Customer>(),
    supabase
      .from("bookings")
      .select("*")
      .eq("cleaner_id", user.id)
      .eq("customer_id", id)
      .order("scheduled_date", { ascending: false })
      .order("scheduled_start", { ascending: false })
      .returns<Booking[]>(),
    // "Reviews from cleaners" — every cleaner's rating of this host that
    // includes a free-text review (see migration 0028), not just this
    // cleaner's own. Uses the admin client since RLS ("Participants read
    // ratings") would otherwise hide other cleaners' rows.
    supabase
      .from("ratings")
      .select("id, score, review_text, updated_at, rater:profiles!rater_id(full_name)")
      .eq("ratee_id", id)
      .eq("ratee_role", "customer")
      .not("review_text", "is", null)
      .order("updated_at", { ascending: false })
      .returns<{ id: string; score: number; review_text: string; updated_at: string; rater: { full_name: string | null } | null }[]>(),
  ]);

  if (!profile || !bookings || bookings.length === 0) notFound();

  const reviews: ReviewItem[] = (reviewRows ?? []).map((r) => ({
    id: r.id,
    score: r.score,
    reviewText: r.review_text,
    reviewerName: r.rater?.full_name ?? "A cleaner",
  }));

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-4">
      <BackLink fromDashboard={fromDashboard} />

      <HostProfileCard
        fullName={profile.full_name ?? "Customer"}
        avatarUrl={profile.avatar_url}
        customer={customer}
        reviews={reviews}
      />

      {/* Booking history */}
      <h2 className="text-base font-semibold text-gray-500 uppercase tracking-wide mt-2">
        Booking history
      </h2>

      {!bookings || bookings.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md py-10 text-center text-gray-400">
          No bookings with this customer yet.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {bookings.map((b) => (
            <div key={b.id} className="bg-white rounded-2xl shadow-md p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-start gap-4 min-w-0">
                  <DateCube date={b.scheduled_date} />
                 <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600 min-w-0">
                <div>
                  <p className="text-gray-400 uppercase tracking-wide text-xs mb-0.5">Time</p>
                  <p className="font-medium">{b.scheduled_start.slice(0, 5)}</p>
                </div>
                <div>
                  <p className="text-gray-400 uppercase tracking-wide text-xs mb-0.5">Duration</p>
                  <p className="font-medium">{b.duration_hours}h</p>
                </div>
                <div className="min-w-0">
                  <p className="text-gray-400 uppercase tracking-wide text-xs mb-0.5">Location</p>
                  <p className="font-medium break-words">{b.address}</p>
                </div>
              </div>
                </div>
                <span className={`text-sm font-medium px-3 py-1 rounded-full ${STATUS_STYLES[b.status]}`}>
                  {b.status}
                </span>
              </div>
              {b.notes && (
                <p className="text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2 mt-2">{b.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
