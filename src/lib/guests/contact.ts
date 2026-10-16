export const PHONE_ERROR = "Enter a WhatsApp number with country code, for example +62 812 3456 7890.";

// A syntax check, not a claim that the number has a WhatsApp account.
export function normalizeGuestPhone(value: string | null | undefined) {
  const raw = (value ?? "").trim();
  if (!/^(\+|00)[\d\s().-]+$/.test(raw)) return null;
  const digits = raw.replace(/^(\+|00)/, "").replace(/[\s().-]/g, "");
  return /^[1-9]\d{6,14}$/.test(digits) ? `+${digits}` : null;
}

export function validGuestEmail(value: string) {
  return !value || (value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));
}
