import { normalizeGuestPhone } from "./contact.ts";
// Never guess a country code for a local number.
export function whatsappPhone(value: string | null | undefined) {
  return normalizeGuestPhone(value)?.slice(1) ?? null;
}

export function invitationLink(
  origin: string,
  slug: string,
  token: string,
  pass = false,
) {
  const url = new URL(`/i/${encodeURIComponent(slug)}`, origin);
  url.searchParams.set("guest", token);
  if (pass) url.hash = "reception-pass";
  return url.toString();
}

export function publicShareOrigin(origin: string) {
  const url = new URL(origin);
  const host = url.hostname.toLowerCase();
  return (
    url.protocol === "https:" &&
    !(
      host === "localhost" ||
      host.endsWith(".localhost") ||
      host.endsWith(".local") ||
      host === "[::1]" ||
      /^127\./.test(host) ||
      /^10\./.test(host) ||
      /^192\.168\./.test(host) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(host)
    )
  );
}

export function whatsappUrl(phone: string, message: string) {
  const number = whatsappPhone(phone);
  return number
    ? `https://wa.me/${number}?text=${encodeURIComponent(message)}`
    : null;
}
