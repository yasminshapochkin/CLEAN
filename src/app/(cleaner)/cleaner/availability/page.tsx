import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CalendarGrid from "./CalendarGrid";
import type { CleanerAvailability } from "@/types/database";

export default async function AvailabilityPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch availability for the next 4 weeks
  const today = new Date();
  const from = today.toISOString().split("T")[0];
  const to = new Date(today.getTime() + 28 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const { data: slots } = await supabase
    .from("cleaner_availability")
    .select("*")
    .eq("cleaner_id", user.id)
    .gte("date", from)
    .lte("date", to)
    .order("date")
    .order("start_time")
    .returns<CleanerAvailability[]>();

  return (
    <div className="-mx-8 -mt-20 lg:-mt-8 flex flex-col min-h-screen bg-white">
      <div className="px-6 pt-6 pb-3 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Availability</h1>
        <p className="text-base text-gray-500">
          Set your availability for the next 4 weeks. Customers can only book during these hours.
        </p>
      </div>
      <CalendarGrid slots={slots ?? []} />
    </div>
  );
}
