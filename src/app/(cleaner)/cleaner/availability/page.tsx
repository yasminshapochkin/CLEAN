import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AvailabilityGrid from "./AvailabilityGrid";
import type { CleanerAvailability } from "@/types/database";

export default async function AvailabilityPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: slots } = await supabase
    .from("cleaner_availability")
    .select("*")
    .eq("cleaner_id", user.id)
    .order("day_of_week")
    .order("start_time")
    .returns<CleanerAvailability[]>();

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Availability</h1>
      <p className="text-sm text-gray-500 mb-6">
        Set your weekly recurring availability. Customers can only book during these hours.
      </p>
      <AvailabilityGrid slots={slots ?? []} />
    </div>
  );
}
