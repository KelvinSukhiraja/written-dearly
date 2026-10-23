"use server";
import { revalidatePath } from "next/cache";
import { requireInvitation } from "@/lib/dashboard/session";
export async function setWishHidden(id: string, hidden: boolean) {
  if (!/^[0-9a-f-]{36}$/.test(id) || typeof hidden !== "boolean")
    return { ok: false as const, error: "Choose a valid wish." };
  const { supabase, invitation } = await requireInvitation();
  const { data, error } = await supabase
    .from("invitation_wish_messages")
    .update({ hidden })
    .eq("id", id)
    .eq("invitation_id", invitation.id)
    .select("id")
    .maybeSingle();
  if (error || !data)
    return {
      ok: false as const,
      error: "This wish could not be updated. Please reload and try again.",
    };
  revalidatePath("/dashboard/invitation");
  revalidatePath(`/i/${invitation.slug}`);
  revalidatePath(`/preview/${invitation.slug}`);
  return { ok: true as const };
}
