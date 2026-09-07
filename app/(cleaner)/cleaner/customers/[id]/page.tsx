import { getCurrentUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect, notFound } from "next/navigation";
import Image from "next/image";
import type { Profile, Booking, Customer } from "@/types/database";
import BackLink from "./BackLink";
import DateCube from "./DateCube";
import ReviewsList, { type ReviewItem } from "./ReviewsList";
import { HouseIcon, PinIcon, StarIcon, PawIcon, SparkleIcon, DocIcon, CheckIcon, HOME_FIELD_ICONS } from "./Icons";

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

// Shared card look (cream, matching the mockup) for every profile section.
const CARD = "bg-[#F7F4EA] rounded-2xl shadow-sm p-6";
const SECTION_TITLE = "font-serif font-bold text-lg text-emerald-950";

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

  const isVerified = customer?.status === "approved";
  const ratingCount = customer?.rating_count ?? 0;
  const ratingAvg = customer?.rating_avg != null ? Number(customer.rating_avg) : null;
  const cleansCompleted = customer?.cleans_completed ?? 0;

  const dwellingLabel = customer?.dwelling_type
    ? DWELLING_LABELS[customer.dwelling_type] ?? customer.dwelling_type
    : null;
  const homeTypeLine = [dwellingLabel, customer?.address].filter(Boolean).join(" · ");

  // "The home" — merges the older num_rooms/floor fields (still edited from
  // /profile) with the newer bedrooms/bathrooms/num_floors fields (from the
  // host onboarding wizard) since a given customer may only have one set.
  // Each row's `text` is the fully formatted display string; `icon` keys into
  // HOME_FIELD_ICONS.
  const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;
  const bedrooms = customer?.bedrooms ?? customer?.num_rooms ?? null;
  const homeFields: { icon: string; text: string }[] = customer
    ? [
        bedrooms != null ? { icon: "Bedrooms", text: plural(bedrooms, customer.bedrooms != null ? "bedroom" : "room") } : null,
        customer.bathrooms != null ? { icon: "Bathrooms", text: plural(customer.bathrooms, "bathroom") } : null,
        customer.floor != null ? { icon: "Floor", text: `Floor ${customer.floor}` } : null,
        customer.num_floors != null ? { icon: "Floors", text: plural(customer.num_floors, "floor") } : null,
        customer.house_size_sqm != null ? { icon: "Size", text: `~${customer.house_size_sqm} m²` } : null,
        customer.num_people != null
          ? { icon: "People", text: customer.num_people === 1 ? "1 person lives here" : `${customer.num_people} people live here` }
          : null,
        customer.num_kids_under_15 != null ? { icon: "Kids under 15", text: `${plural(customer.num_kids_under_15, "kid")} under 15` } : null,
      ].filter((f): f is { icon: string; text: string } => f !== null)
    : [];

  const hasPets = (customer?.pet_types?.length ?? 0) > 0;
  const petCountLabel = customer?.pet_types
    ?.map((p) => (p === "dog" ? "dog" : p === "cat" ? "cat" : "pet"))
    .join(" & ");
  const petLine = customer?.num_pets ? `${customer.num_pets} ${petCountLabel}` : petCountLabel;

  const priorityBubbles = (customer?.cleaning_priorities ?? []).map((p) =>
    p === "other" ? customer?.cleaning_priorities_other || "Other" : PRIORITY_LABELS[p] ?? p
  );

  const reviews: ReviewItem[] = (reviewRows ?? []).map((r) => ({
    id: r.id,
    score: r.score,
    reviewText: r.review_text,
    reviewerName: r.rater?.full_name ?? "A cleaner",
  }));

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-4">
      <BackLink fromDashboard={fromDashboard} />

      {/* Profile header */}
      <div className={CARD}>
        <div className="flex items-start gap-5">
          <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden shrink-0">
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.full_name ?? "Customer"}
                width={96}
                height={96}
                className="object-cover w-full h-full"
              />
            ) : null}
          </div>
          <div className="min-w-0">
            <h1 className="font-serif text-3xl font-bold text-emerald-950">{profile.full_name ?? "Customer"}</h1>
            {isVerified && (
              <span className="inline-flex items-center gap-1.5 mt-2 text-sm font-medium px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                <CheckIcon className="w-3.5 h-3.5" /> Verified host
              </span>
            )}
            {customer?.address && (
              <p className="flex items-center gap-1.5 text-emerald-800 mt-2 text-sm">
                <PinIcon className="w-4 h-4 shrink-0" /> {customer.address}
              </p>
            )}
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-2">
                <StarIcon className="w-6 h-6 text-amber-400" />
                <div className="leading-tight">
                  <p className="font-bold text-lg text-emerald-950">{ratingAvg != null ? ratingAvg.toFixed(1) : "—"}</p>
                  <p className="text-xs text-gray-500">Host rating</p>
                </div>
              </div>
              {cleansCompleted > 0 && (
                <>
                  <div className="w-px h-8 bg-emerald-900/10" />
                  <div className="flex items-center gap-2">
                    <HouseIcon className="w-6 h-6 text-emerald-700" />
                    <div className="leading-tight">
                      <p className="font-bold text-lg text-emerald-950">{cleansCompleted}</p>
                      <p className="text-xs text-gray-500">Cleans completed</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* About me */}
      {customer?.bio && (
        <div className={CARD}>
          <h2 className={`${SECTION_TITLE} mb-2`}>About me</h2>
          <p className="text-gray-700 whitespace-pre-line">{customer.bio}</p>
        </div>
      )}

      {/* The home + Pets */}
      {(homeFields.length > 0 || hasPets) && (
        <div className="grid sm:grid-cols-2 gap-4">
          {homeFields.length > 0 && (
            <div className={CARD}>
              <div className="flex items-center gap-2 mb-1">
                <HouseIcon className="w-5 h-5 text-emerald-700 shrink-0" />
                <h2 className={SECTION_TITLE}>The home</h2>
              </div>
              {homeTypeLine && <p className="text-sm text-gray-500 mb-3">{homeTypeLine}</p>}
              <div className="flex flex-col gap-2.5">
                {homeFields.map((f) => {
                  const FieldIcon = HOME_FIELD_ICONS[f.icon];
                  return (
                    <div key={f.icon} className="flex items-center gap-2.5 text-sm text-emerald-950">
                      {FieldIcon ? (
                        <FieldIcon className="w-4 h-4 text-emerald-700 shrink-0" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 shrink-0" />
                      )}
                      <span>{f.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {hasPets && (
            <div className={CARD}>
              <div className="flex items-center gap-2 mb-3">
                <PawIcon className="w-5 h-5 text-emerald-700 shrink-0" />
                <h2 className={SECTION_TITLE}>Pets</h2>
              </div>
              <div className="flex items-center justify-between gap-3 mb-3">
                <p className="font-semibold text-emerald-950">{petLine}</p>
                {customer?.pet_photo_url ? (
                  <div className="w-14 h-14 rounded-full bg-gray-100 overflow-hidden shrink-0">
                    <Image
                      src={customer.pet_photo_url}
                      alt="Pet"
                      width={56}
                      height={56}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                    <PawIcon className="w-6 h-6 text-emerald-300" />
                  </div>
                )}
              </div>
              {customer?.pet_note && (
                <div className="bg-white/60 rounded-xl px-3 py-2.5 text-sm text-gray-600 italic">
                  &ldquo;{customer.pet_note}&rdquo;
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Usually clean */}
      {priorityBubbles.length > 0 && (
        <div className={CARD}>
          <div className="flex items-center gap-2 mb-3">
            <SparkleIcon className="w-5 h-5 text-emerald-700 shrink-0" />
            <h2 className={SECTION_TITLE}>Usually clean</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {priorityBubbles.map((label) => (
              <span
                key={label}
                className="text-sm px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Home notes */}
      {customer?.home_instructions && (
        <div className={CARD}>
          <div className="flex items-center gap-2 mb-3">
            <DocIcon className="w-5 h-5 text-emerald-700 shrink-0" />
            <h2 className={SECTION_TITLE}>Home notes</h2>
          </div>
          <div className="bg-white/60 rounded-xl px-3 py-2.5 text-sm text-gray-600 italic whitespace-pre-line">
            &ldquo;{customer.home_instructions}&rdquo;
          </div>
        </div>
      )}

      {/* Reviews from cleaners */}
      <div className={CARD}>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <StarIcon className="w-5 h-5 text-emerald-700 shrink-0" />
            <h2 className={SECTION_TITLE}>Reviews from cleaners</h2>
          </div>
          {ratingCount > 0 && ratingAvg != null && (
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="font-bold text-emerald-950">{ratingAvg.toFixed(1)}</span>
              <StarIcon className="w-4 h-4 text-emerald-700" />
              <span className="text-sm text-gray-400">({ratingCount} {ratingCount === 1 ? "review" : "reviews"})</span>
            </div>
          )}
        </div>
        {reviews.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-2">No reviews yet.</p>
        ) : (
          <ReviewsList reviews={reviews} />
        )}
      </div>

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
