import type { SupabaseClient } from "@supabase/supabase-js";

export type PublicWish = { name: string; message: string };
export type InvitationWishes = {
  ready: boolean;
  items: PublicWish[];
  ownMessage?: string;
};
export const noWishes: InvitationWishes = { ready: false, items: [] };

export async function loadInvitationWishes(
  client: SupabaseClient,
  slug: string,
  token?: string,
): Promise<InvitationWishes> {
  const { data, error } = await client.rpc("invitation_wishes", {
    p_slug: slug,
  });
  if (error) {
    if (["PGRST202", "42883"].includes(error.code)) return noWishes;
    throw new Error("Wishes could not be loaded. Please try again.");
  }
  let ownMessage = "";
  if (token) {
    const own = await client.rpc("invitation_own_wish", {
      p_slug: slug,
      p_token: token,
    });
    if (own.error)
      throw new Error("Your wish could not be loaded. Please try again.");
    ownMessage = typeof own.data === "string" ? own.data : "";
  }
  return { ready: true, items: data ?? [], ownMessage };
}
