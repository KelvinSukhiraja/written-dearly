"use server";
import { revalidatePath } from "next/cache";
import { requireInvitation } from "@/lib/dashboard/session";
import { supportedDesign } from "@/lib/invitations/designs";
import type { ActionResult } from "../actions";

export async function chooseDesign(
  _previous: ActionResult | null,
  form: FormData,
): Promise<ActionResult> {
  const { supabase, invitation, user } = await requireInvitation();
  const id = String(form.get("template_id") ?? "");
  const { data: template, error: lookupError } = await supabase
    .from("templates")
    .select("id, component_key")
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();
  if (lookupError || !template || !supportedDesign(template.component_key))
    return {
      ok: false,
      error:
        "This design is not available. Refresh and choose an available design.",
    };
  const { data, error } = await supabase
    .from("invitations")
    .update({ template_id: template.id })
    .eq("id", invitation.id)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();
  if (error || !data)
    return {
      ok: false,
      error: "Your design could not be saved. Please try again.",
    };
  revalidatePath("/dashboard", "layout");
  revalidatePath(`/i/${invitation.slug}`);
  return { ok: true };
}
