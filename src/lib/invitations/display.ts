import type { Invitation } from "@/lib/supabase/types";

const DATE_LOCALE = "en-GB";

export function coupleNames(invitation: Invitation) {
  return [invitation.bride_name, invitation.groom_name]
    .map((name) => name?.trim())
    .filter(Boolean)
    .join(" & ");
}

export function coupleInitials(invitation: Invitation) {
  return {
    bride: invitation.bride_name?.trim().charAt(0).toUpperCase() || "B",
    groom: invitation.groom_name?.trim().charAt(0).toUpperCase() || "G",
  };
}

export function formatWeddingDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(DATE_LOCALE, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatInviteDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(DATE_LOCALE, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTableDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(DATE_LOCALE, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(value: string | null) {
  if (!value) return "Just now";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";
  return date.toLocaleString(DATE_LOCALE, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
