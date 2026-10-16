import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Guest, Invitation, Profile } from "@/lib/supabase/types";

export async function requireCouple() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/login");
  }

  const { data: existing } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  let profile = existing as Profile | null;

  if (!profile) {
    const name =
      (typeof user.user_metadata?.name === "string" && user.user_metadata.name) ||
      user.email.split("@")[0];

    const { data: created, error } = await supabase
      .from("users")
      .insert({ id: user.id, email: user.email, name })
      .select("*")
      .single();

    if (error || !created) {
      redirect("/login?error=profile");
    }

    profile = created as Profile;
  }

  return { supabase, user, profile };
}

export async function requireInvitation() {
  const ctx = await requireCouple();
  const { supabase, user } = ctx;

  const { data: existing } = await supabase
    .from("invitations")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (existing) {
    return { ...ctx, invitation: existing as Invitation };
  }

  const { data: template } = await supabase
    .from("templates")
    .select("id")
    .eq("component_key", "classic")
    .eq("is_active", true)
    .maybeSingle();

  if (!template) {
    throw new Error("No active invitation template was found.");
  }

  const slug = `invite-${user.id.replaceAll("-", "").slice(0, 10)}`;
  const { data: created, error } = await supabase
    .from("invitations")
    .insert({
      id: crypto.randomUUID(),
      user_id: user.id,
      slug,
      template_id: template.id,
    })
    .select("*")
    .single();

  if (error || !created) {
    throw new Error(error?.message ?? "Could not create an invitation.");
  }

  return { ...ctx, invitation: created as Invitation };
}

export async function getGuests(invitationId: string) {
  const { supabase } = await requireCouple();
  const guests: Guest[]=[];
  for(let offset=0;;offset+=500) {
    const {data,error}=await supabase.from('guests').select('*').eq('invitation_id',invitationId).order('name').order('id').range(offset,offset+499);
    if(error) throw new Error(error.message);
    guests.push(...(data??[]) as Guest[]);
    if(!data || data.length<500) break;
  }
  return guests;
}
