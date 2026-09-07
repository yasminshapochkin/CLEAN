import Image from "next/image";
import type { Customer } from "@/types/database";
import ReviewsList, { type ReviewItem } from "./HostProfileReviews";
import { HouseIcon, PinIcon, StarIcon, PawIcon, SparkleIcon, DocIcon, CheckIcon, HOME_FIELD_ICONS } from "./HostProfileIcons";

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

// Shared card look (cream, matching the stakeholder mockup) for every
// section. Padding/icon/type sizes are deliberately generous — the mockup
// this is built from is proportioned for a narrow mobile card, and matching
// its relative proportions (not its absolute pixel sizes) on a wider web
// container means every element ends up a bit larger than a "default" web
// density would suggest.
const CARD = "bg-[#F7F4EA] rounded-2xl shadow-sm p-7";
const SECTION_TITLE = "font-serif font-bold text-xl text-emerald-950";

// The host profile card — the same "how a cleaner sees this host" view used
// both on the cleaner-facing /cleaner/customers/[id] page and, via an
// `action` slot for an edit affordance, on the host's own /profile page (so
// a host's own profile reads exactly like what other people already see,
// only the edit toggle differs — mirroring the cleaner side's
// ProfileView/ProfileForm pattern). No booking history here — that's
// specific to the cleaner-facing page and rendered by its caller.
export default function HostProfileCard({
  fullName,
  avatarUrl,
  customer,
  reviews,
  action,
}: {
  fullName: string;
  avatarUrl: string | null;
  customer: Customer | null;
  reviews: ReviewItem[];
  action?: React.ReactNode;
}) {
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

  return (
    <div className="flex flex-col gap-4">
      {action}

      {/* Profile header */}
      <div className={CARD}>
        <div className="flex items-start gap-6">
          <div className="w-32 h-32 rounded-full bg-gray-200 overflow-hidden shrink-0">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={fullName}
                width={128}
                height={128}
                className="object-cover w-full h-full"
              />
            ) : null}
          </div>
          <div className="min-w-0">
            <h1 className="font-serif text-4xl font-bold text-emerald-950">{fullName}</h1>
            {isVerified && (
              <span className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800">
                <CheckIcon className="w-4 h-4" /> Verified host
              </span>
            )}
            {customer?.address && (
              <p className="flex items-center gap-1.5 text-emerald-800 mt-2.5 text-base">
                <PinIcon className="w-5 h-5 shrink-0" /> {customer.address}
              </p>
            )}
            <div className="flex items-center gap-5 mt-4">
              <div className="flex items-center gap-2.5">
                <StarIcon className="w-7 h-7 text-amber-400" />
                <div className="leading-tight">
                  <p className="font-bold text-2xl text-emerald-950">{ratingAvg != null ? ratingAvg.toFixed(1) : "—"}</p>
                  <p className="text-sm text-gray-500">Host rating</p>
                </div>
              </div>
              {cleansCompleted > 0 && (
                <>
                  <div className="w-px h-10 bg-emerald-900/10" />
                  <div className="flex items-center gap-2.5">
                    <HouseIcon className="w-7 h-7 text-emerald-700" />
                    <div className="leading-tight">
                      <p className="font-bold text-2xl text-emerald-950">{cleansCompleted}</p>
                      <p className="text-sm text-gray-500">Cleans completed</p>
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
          <h2 className={`${SECTION_TITLE} mb-2.5`}>About me</h2>
          <p className="text-base text-gray-700 whitespace-pre-line">{customer.bio}</p>
        </div>
      )}

      {/* The home + Pets */}
      {(homeFields.length > 0 || hasPets) && (
        <div className="grid sm:grid-cols-2 gap-4">
          {homeFields.length > 0 && (
            <div className={CARD}>
              <div className="flex items-center gap-2.5 mb-1.5">
                <HouseIcon className="w-6 h-6 text-emerald-700 shrink-0" />
                <h2 className={SECTION_TITLE}>The home</h2>
              </div>
              {homeTypeLine && <p className="text-base text-gray-500 mb-4">{homeTypeLine}</p>}
              <div className="flex flex-col gap-3.5">
                {homeFields.map((f) => {
                  const FieldIcon = HOME_FIELD_ICONS[f.icon];
                  return (
                    <div key={f.icon} className="flex items-center gap-3 text-base text-emerald-950">
                      {FieldIcon ? (
                        <FieldIcon className="w-5 h-5 text-emerald-700 shrink-0" />
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
              <div className="flex items-center gap-2.5 mb-4">
                <PawIcon className="w-6 h-6 text-emerald-700 shrink-0" />
                <h2 className={SECTION_TITLE}>Pets</h2>
              </div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <p className="font-semibold text-lg text-emerald-950">{petLine}</p>
                {customer?.pet_photo_url ? (
                  <div className="w-20 h-20 rounded-full bg-gray-100 overflow-hidden shrink-0">
                    <Image
                      src={customer.pet_photo_url}
                      alt="Pet"
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                    <PawIcon className="w-8 h-8 text-emerald-300" />
                  </div>
                )}
              </div>
              {customer?.pet_note && (
                <div className="bg-white/60 rounded-xl px-4 py-3 text-base text-gray-600 italic">
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
          <div className="flex items-center gap-2.5 mb-4">
            <SparkleIcon className="w-6 h-6 text-emerald-700 shrink-0" />
            <h2 className={SECTION_TITLE}>Usually clean</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {priorityBubbles.map((label) => (
              <span
                key={label}
                className="text-base px-4 py-2 rounded-full bg-emerald-50 text-emerald-800"
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
          <div className="flex items-center gap-2.5 mb-4">
            <DocIcon className="w-6 h-6 text-emerald-700 shrink-0" />
            <h2 className={SECTION_TITLE}>Home notes</h2>
          </div>
          <div className="bg-white/60 rounded-xl px-4 py-3 text-base text-gray-600 italic whitespace-pre-line">
            &ldquo;{customer.home_instructions}&rdquo;
          </div>
        </div>
      )}

      {/* Reviews from cleaners */}
      <div className={CARD}>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <StarIcon className="w-6 h-6 text-emerald-700 shrink-0" />
            <h2 className={SECTION_TITLE}>Reviews from cleaners</h2>
          </div>
          {ratingCount > 0 && ratingAvg != null && (
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="font-bold text-lg text-emerald-950">{ratingAvg.toFixed(1)}</span>
              <StarIcon className="w-5 h-5 text-emerald-700" />
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
    </div>
  );
}
