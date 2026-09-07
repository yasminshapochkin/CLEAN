import { getCurrentUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect, notFound } from "next/navigation";
import Image from "next/image";
import type { Profile, Booking, Customer } from "@/types/database";
import BackLink from "./BackLink";
import DateCube from "./DateCube";
import { StarRatingDisplay } from "@/components/StarRating";

const STATUS_STYLES: Record<string, string> = {
  pending:   "bg-yellow-100 text-yellow-700",
  accepted:  "bg-green-100 text-green-700",
  declined:  "bg-red-100 text-red-700",
  completed: "bg-blue-100 text-blue-700",
  cancelled: "bg-gray-100 text-gray-500",
};

const DWELLING_LABELS: Record<string, string> = {
  apartment: "Apartment",
  house: "House",
  guesthouse: "Guesthouse",
  other: "Other",
};

const PRIORITY_LABELS: Record<string, string> = {
  kitchen: "Kitchen",
  bathrooms: "Bathrooms",
  floors: "Floors",
  dusting: "Dusting",
  windows: "Windows",
  linens: "Linens",
  laundry: "Laundry",
  outdoor: "Outdoor",
};

const CLEANING_TYPE_LABELS: Record<string, string> = {
  regular: "Regular clean",
  deep: "Deep clean",
};

const FREQUENCY_LABELS: Record<string, string> = {
  weekly: "Weekly",
  twice_monthly: "Twice a month",
  occasional: "Occasionally",
  one_time: "One-time",
};

// A small placeholder for sections whose feature isn't built yet — kept
// visually consistent with the mockup ("keep the space blank and write
// coming soon") rather than just omitting the section.
function ComingSoon({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-4 text-center text-sm text-gray-400">
      {label} coming soon
    </div>
  );
}

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

  const [{ data: profile }, { data: customer }, { data: bookings }] = await Promise.all([
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
  ]);

  if (!profile || !bookings || bookings.length === 0) notFound();

  const isVerified = customer?.status === "approved";

  // "The home" — merges the older num_rooms/floor fields (still edited from
  // /profile) with the newer bedrooms/bathrooms/num_floors fields (from the
  // host onboarding wizard) since a given customer may only have one set.
  const homeFields: { label: string; value: string }[] = customer
    ? [
        { label: "Type", value: customer.dwelling_type ? DWELLING_LABELS[customer.dwelling_type] ?? customer.dwelling_type : "" },
        {
          label: customer.bedrooms != null ? "Bedrooms" : "Rooms",
          value: customer.bedrooms != null ? String(customer.bedrooms) : customer.num_rooms != null ? String(customer.num_rooms) : "",
        },
        { label: "Bathrooms", value: customer.bathrooms != null ? String(customer.bathrooms) : "" },
        { label: "Floor", value: customer.floor != null ? String(customer.floor) : "" },
        { label: "Floors", value: customer.num_floors != null ? String(customer.num_floors) : "" },
        { label: "Size", value: customer.house_size_sqm != null ? `${customer.house_size_sqm} m²` : "" },
        { label: "People", value: customer.num_people != null ? String(customer.num_people) : "" },
        { label: "Kids under 15", value: customer.num_kids_under_15 != null ? String(customer.num_kids_under_15) : "" },
      ].filter((f) => f.value !== "")
    : [];

  const hasPets = (customer?.pet_types?.length ?? 0) > 0;
  const petTypesLabel = customer?.pet_types
    ?.map((p) => (p === "dog" ? "Dog" : p === "cat" ? "Cat" : "Other"))
    .join(" & ");

  const priorityBubbles = (customer?.cleaning_priorities ?? []).map((p) =>
    p === "other" ? customer?.cleaning_priorities_other || "Other" : PRIORITY_LABELS[p] ?? p
  );

  return (
    <div className="max-w-2xl mx-auto">
      <BackLink fromDashboard={fromDashboard} />

      {/* Profile header */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-gray-100 overflow-hidden shrink-0">
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.full_name ?? "Customer"}
                width={80}
                height={80}
                className="object-cover w-full h-full"
              />
            ) : null}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">{profile.full_name ?? "Customer"}</h1>
              {isVerified && (
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                  ✓ Verified host
                </span>
              )}
            </div>
            {customer?.address && <p className="text-sm text-gray-500 mt-0.5">{customer.address}</p>}
            <div className="flex items-center gap-3 mt-1.5">
              <StarRatingDisplay
                value={customer?.rating_avg}
                count={customer?.rating_count}
                size="sm"
                emptyLabel="No ratings yet"
              />
              {(customer?.cleans_completed ?? 0) > 0 && (
                <p className="text-sm text-gray-500">
                  {customer?.cleans_completed} {customer?.cleans_completed === 1 ? "clean" : "cleans"} completed
                </p>
              )}
            </div>
          </div>
        </div>
        {customer?.bio && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-gray-400 uppercase tracking-wide text-xs mb-1">About me</p>
            <p className="text-base text-gray-700 whitespace-pre-line">{customer.bio}</p>
          </div>
        )}
      </div>

      {/* The home */}
      {homeFields.length > 0 && (
        <>
          <h2 className="text-base font-semibold text-gray-500 uppercase tracking-wide mb-3">The home</h2>
          <div className="bg-white rounded-2xl shadow-md p-6 mb-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {homeFields.map((f) => (
              <div key={f.label}>
                <p className="text-gray-400 uppercase tracking-wide text-xs mb-0.5">{f.label}</p>
                <p className="text-base font-semibold text-gray-900">{f.value}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Pets */}
      {hasPets && (
        <>
          <h2 className="text-base font-semibold text-gray-500 uppercase tracking-wide mb-3">Pets</h2>
          <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-gray-50 border border-dashed border-gray-200 flex flex-col items-center justify-center text-xs text-gray-400 text-center shrink-0 leading-tight">
                <span>Photo</span>
                <span>coming soon</span>
              </div>
              <div className="min-w-0">
                <p className="text-base font-semibold text-gray-900">
                  {petTypesLabel}
                  {customer?.num_pets ? ` (${customer.num_pets})` : ""}
                </p>
                {customer?.pet_note && (
                  <p className="text-sm text-gray-600 italic mt-1">&ldquo;{customer.pet_note}&rdquo;</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Usually clean */}
      {(priorityBubbles.length > 0 || customer?.usual_cleaning_type || customer?.usage_frequency) && (
        <>
          <h2 className="text-base font-semibold text-gray-500 uppercase tracking-wide mb-3">Usually clean</h2>
          <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
            {(customer?.usual_cleaning_type || customer?.usage_frequency) && (
              <p className="text-sm text-gray-600 mb-3">
                {[
                  customer?.usual_cleaning_type ? CLEANING_TYPE_LABELS[customer.usual_cleaning_type] : null,
                  customer?.usage_frequency ? FREQUENCY_LABELS[customer.usage_frequency] : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
            {priorityBubbles.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {priorityBubbles.map((label) => (
                  <span
                    key={label}
                    className="text-sm px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100"
                  >
                    {label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Home notes */}
      {customer?.home_instructions && (
        <>
          <h2 className="text-base font-semibold text-gray-500 uppercase tracking-wide mb-3">Home notes</h2>
          <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <p className="text-sm text-gray-600 italic whitespace-pre-line">&ldquo;{customer.home_instructions}&rdquo;</p>
          </div>
        </>
      )}

      {/* Reviews from cleaners */}
      <h2 className="text-base font-semibold text-gray-500 uppercase tracking-wide mb-3">Reviews from cleaners</h2>
      <div className="mb-6">
        <ComingSoon label="Reviews" />
      </div>

      {/* Booking history */}
      <h2 className="text-base font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Booking history
      </h2>

      {!bookings || bookings.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md py-10 text-center text-gray-400">
          No bookings with this customer yet.
        </div>
      ) : (
        <div className="space-y-3">
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
