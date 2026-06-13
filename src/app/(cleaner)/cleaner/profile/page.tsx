import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfileForm from "./ProfileForm";
import GalleryManager from "./GalleryManager";
import type { Profile, Cleaner, CleanerGalleryPhoto } from "@/types/database";

export default async function CleanerProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();

  const [{ data: profile }, { data: cleaner }, { data: photos }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single<Profile>(),
    supabase.from("cleaners").select("*").eq("id", user.id).single<Cleaner>(),
    supabase
      .from("cleaner_gallery")
      .select("*")
      .eq("cleaner_id", user.id)
      .order("created_at", { ascending: false })
      .returns<CleanerGalleryPhoto[]>(),
  ]);

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Profile</h1>
      <p className="text-base text-gray-500 mb-6">
        Keep your profile updated so customers can find and trust you.
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
        <ProfileForm profile={profile} cleaner={cleaner} />
        <GalleryManager photos={photos ?? []} />
      </div>
    </div>
  );
}
