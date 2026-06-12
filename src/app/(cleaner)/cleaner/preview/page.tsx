import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Profile, Cleaner, CleanerAvailability } from "@/types/database";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default async function PreviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: cleaner }, { data: slots }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single<Profile>(),
    supabase.from("cleaners").select("*").eq("id", user.id).single<Cleaner>(),
    supabase
      .from("cleaner_availability")
      .select("*")
      .eq("cleaner_id", user.id)
      .order("day_of_week")
      .order("start_time")
      .returns<CleanerAvailability[]>(),
  ]);

  const slotsByDay = DAYS.reduce<Record<number, CleanerAvailability[]>>((acc, _, i) => {
    acc[i] = (slots ?? []).filter((s) => s.day_of_week === i);
    return acc;
  }, {});

  return (
    <div className="absolute inset-0 overflow-y-auto bg-gray-100">
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
          <div className="w-48 h-48 rounded-full bg-gray-200 border-4 border-white overflow-hidden shrink-0 shadow">
            {profile?.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt="Profile photo"
                width={192}
                height={192}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-5xl bg-gray-100">
                👤
              </div>
            )}
          </div>
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
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-10 py-8 grid grid-cols-3 gap-6">

        {/* Left column — main info */}
        <div className="col-span-2 space-y-5">

          {/* Bio */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">About</h2>
            <p className="text-base text-gray-700 leading-relaxed">
              {cleaner?.bio ?? <span className="text-gray-400">No bio written yet.</span>}
            </p>
          </div>

          {/* Availability */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Availability</h2>
            {(slots ?? []).length === 0 ? (
              <p className="text-base text-gray-400">No availability set yet.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {DAYS.map((day, i) => (
                  <div key={day} className={`rounded-xl border p-4 min-h-[120px] flex flex-col ${slotsByDay[i].length === 0 ? "bg-red-50 border-red-100" : "bg-gray-50 border-gray-200"}`}>
                    <div className="text-base font-bold text-gray-700 mb-3">{day}</div>
                    <div className="flex-1 space-y-2">
                      {slotsByDay[i].length === 0 ? (
                        <p className="text-base text-gray-300">—</p>
                      ) : (
                        slotsByDay[i].map((slot) => (
                          <div key={slot.id} className="bg-blue-50 rounded-lg px-3 py-2">
                            <span className="text-base font-medium text-blue-700">
                              {slot.start_time.slice(0, 5)}–{slot.end_time.slice(0, 5)}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column — stats */}
        <div className="space-y-5">

          {/* Pricing & details */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            {cleaner?.hourly_rate && (
              <div>
                <p className="text-base text-gray-500">Hourly rate</p>
                <p className="text-2xl font-bold text-gray-900">₪{cleaner.hourly_rate}/hr</p>
              </div>
            )}
            {cleaner?.years_experience != null && (
              <div>
                <p className="text-base text-gray-500">Experience</p>
                <p className="text-lg font-semibold text-gray-900">
                  {cleaner.years_experience} year{cleaner.years_experience !== 1 ? "s" : ""}
                </p>
              </div>
            )}
            {cleaner?.service_radius_km && (
              <div>
                <p className="text-base text-gray-500">Service radius</p>
                <p className="text-lg font-semibold text-gray-900">{cleaner.service_radius_km} km</p>
              </div>
            )}
          </div>

          {/* Languages */}
          {cleaner?.languages && cleaner.languages.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Languages</h2>
              <div className="flex flex-wrap gap-2">
                {cleaner.languages.map((lang) => (
                  <span
                    key={lang}
                    className="bg-gray-100 text-gray-700 text-base px-3 py-1.5 rounded-full"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
