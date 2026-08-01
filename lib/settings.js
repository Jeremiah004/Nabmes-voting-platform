import { getSupabaseAdmin } from "./supabaseAdmin";

export async function getAppSettings() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("app_settings")
    .select("registration_open, voting_open")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data) {
    console.error(error);
    return { registrationOpen: true, votingOpen: false };
  }

  return { registrationOpen: data.registration_open, votingOpen: data.voting_open };
}
