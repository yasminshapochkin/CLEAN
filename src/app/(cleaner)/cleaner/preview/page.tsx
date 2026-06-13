import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import AvailabilityModal from "./AvailabilityModal";
import GalleryLightbox from "./GalleryLightbox";
import AvatarLightbox from "./AvatarLightbox";
import type { Profile, Cleaner, CleanerAvailability, CleanerWeeklyAvailability, CleanerGalleryPhoto } from "@/types/database";
import { slotLabel } from "../availability/utils";

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toLocalDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default async function PreviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const today = new Date();
  const from = toLocalDateStr(today);
  const to = toLocalDateStr(new Date(today.getTime() + 28 * 24 * 60 * 60 * 1000));

  const [{ data: profile }, { data: cleaner }, { data: slots }, { data: weeklySlots }, { data: galleryPhotos }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single<Profile>(),
    supabase.from("cleaners").select("*").eq("id", user.id).single<Cleaner>(),
    supabase
      .from("cleaner_availability")
      .select("*")
      .eq("cleaner_id", user.id)
      .gte("date", from)
      .lte("date", to)
      .order("date")
      .order("start_time")
      .returns<CleanerAvailability[]>(),
    supabase
      .from("cleaner_weekly_availability")
      .select("*")
      .eq("cleaner_id", user.id)
      .order("day_of_week")
      .order("start_time")
      .returns<CleanerWeeklyAvailability[]>(),
    supabase
      .from("cleaner_gallery")
      .select("*")
      .eq("cleaner_id", user.id)
      .order("created_at", { ascending: false })
      .returns<CleanerGalleryPhoto[]>(),
  ]);

  const monday = getMonday(today);
  const days = Array.from({ length: 28 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
  const weeks = Array.from({ length: 4 }, (_, w) =>
    days.slice(w * 7, w * 7 + 7).map((d) => ({
      dateStr: toLocalDateStr(d),
      dayNum: d.getDate(),
      monthName: d.getDate() === 1 ? MONTHS[d.getMonth()] : null,
    }))
  );

  const slotsByDate = (slots ?? []).reduce<Record<string, CleanerAvailability[]>>((acc, s) => {
    if (!acc[s.date]) acc[s.date] = [];
    acc[s.date].push(s);
    return acc;
  }, {});

  return (
    <div className="bg-gray-100 -mx-8 -mt-20 lg:-mt-8 min-h-screen">
      {/* Edit banner */}
      <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-2 flex items-center justify-between">
        <p className="text-base text-yellow-800 font-medium">This is your public profile — as customers see it.</p>
        <Link href="/cleaner/profile" className="text-base text-blue-600 hover:underline font-semibold">
          Edit profile →
        </Link>
      </div>

      {/* Avatar + name row */}
      <div className="bg-white border-b border-gray-200 px-10 py-6">
        <div className="flex items-center gap-6">
          {profile?.avatar_url ? (
            <AvatarLightbox src={profile.avatar_url} name={profile.full_name ?? "Profile photo"} />
          ) : (
            <div className="w-48 h-48 rounded-full bg-gray-100 border-4 border-white overflow-hidden shrink-0 shadow flex items-center justify-center text-gray-400 text-5xl">
              👤
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {profile?.full_name ?? "No name set"}
            </h1>
            <div className="flex flex-wrap gap-2 mt-2">
              {cleaner?.service_types?.map((type) => (
                <span
                  key={type}
                  className="bg-blue-50 text-blue-700 text-base font-medium px-3 py-1 rounded-full capitalize"
                >
                  {type}
                </span>
              ))}
            </div>
            {cleaner?.languages && cleaner.languages.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {cleaner.languages.map((lang) => (
                  <span
                    key={lang}
                    className="bg-gray-100 text-gray-700 text-base px-3 py-1 rounded-full"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats block — reused in both layouts */}
      {(() => {
        const galleryBlock = <GalleryLightbox photos={galleryPhotos ?? []} />;

        const aboutBlock = (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            {(cleaner?.years_experience != null || cleaner?.service_radius_km || cleaner?.hourly_rate) && (
              <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6 mb-4 pb-4 border-b border-gray-100">
                <button className="w-full lg:w-auto shrink-0 bg-blue-600 text-white text-sm font-semibold rounded-xl px-4 py-2.5 hover:bg-blue-700 transition-colors">
                  Request for cleaning
                </button>
                <div className="flex items-center gap-6">
                {cleaner?.years_experience != null && (
                  <div>
                    <p className="text-sm text-gray-500">Experience</p>
                    <p className="text-base font-semibold text-gray-900">
                      {cleaner.years_experience} year{cleaner.years_experience !== 1 ? "s" : ""}
                    </p>
                  </div>
                )}
                {cleaner?.service_radius_km && (
                  <div>
                    <p className="text-sm text-gray-500">Service radius</p>
                    <p className="text-base font-semibold text-gray-900">{cleaner.service_radius_km} km</p>
                  </div>
                )}
                {cleaner?.hourly_rate && (
                  <div>
                    <p className="text-sm text-gray-500">Hourly rate</p>
                    <p className="text-base font-semibold text-gray-900">₪{cleaner.hourly_rate}/hr</p>
                  </div>
                )}
                </div>
              </div>
            )}
            <h2 className="text-lg font-bold text-gray-900 mb-3">About</h2>
            <p className="text-base text-gray-700 leading-relaxed">
              {cleaner?.bio ?? <span className="text-gray-400">No bio written yet.</span>}
            </p>
          </div>
        );

        const desktopAvailability = (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Availability</h2>
            {(slots ?? []).length === 0 && (weeklySlots ?? []).length === 0 ? (
              <p className="text-base text-gray-400">No availability set for the next 4 weeks.</p>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-7 gap-2 mb-1">
                  {WEEK_DAYS.map((d) => (
                    <div key={d} className="text-center text-base font-bold text-gray-500 py-1">{d}</div>
                  ))}
                </div>
                {weeks.map((week, wi) => (
                  <div key={wi} className="grid grid-cols-7 gap-2">
                    {week.map((day) => {
                      const daySlots = slotsByDate[day.dateStr] ?? [];
                      const dow = new Date(day.dateStr + "T12:00:00").getDay();
                      const recurring = (weeklySlots ?? []).filter((s) => s.day_of_week === dow);
                      const hasAny = daySlots.length > 0 || recurring.length > 0;
                      return (
                        <div key={day.dateStr} className={`rounded-xl border p-3 min-h-[90px] flex flex-col ${hasAny ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-100"}`}>
                          <div className="flex items-center gap-1 mb-1">
                            <span className="text-base font-bold text-gray-700">{day.dayNum}</span>
                            {day.monthName && <span className="text-xs text-gray-400">{day.monthName}</span>}
                          </div>
                          <div className="space-y-1">
                            {recurring.map((slot) => (
                              <div key={slot.id} className="bg-blue-100 rounded px-2 py-0.5">
                                <span className="text-sm font-medium text-blue-700">
                                  {slotLabel(slot.start_time, slot.end_time)}
                                </span>
                              </div>
                            ))}
                            {daySlots.map((slot) => (
                              <div key={slot.id} className="bg-blue-100 rounded px-2 py-0.5">
                                <span className="text-sm font-medium text-blue-700">
                                  {slotLabel(slot.start_time, slot.end_time)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        );

        return (
          <>
            {/* ── Mobile layout ── */}
            <div className="lg:hidden px-4 py-6 space-y-4">
              {aboutBlock}
              {galleryBlock}
              <AvailabilityModal weeks={weeks} slots={slots ?? []} weeklySlots={weeklySlots ?? []} />
            </div>

            {/* ── Desktop layout ── */}
            <div className="hidden lg:grid px-10 py-8 grid-cols-3 gap-6">
              <div className="col-span-2 space-y-5">
                {aboutBlock}
                {desktopAvailability}
              </div>
              <div className="space-y-5">
                {galleryBlock}
              </div>
            </div>
          </>
        );
      })()}
    </div>
  );
}
