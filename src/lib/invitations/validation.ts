export function safeUrl(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes("\\"))
    return value;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

export function seatCount(value: unknown, min = 1, max = 100) {
  const number = Number(value);
  return Number.isInteger(number) && number >= min && number <= max
    ? number
    : null;
}

export function receptionToken(value: string) {
  const trimmed = value.trim();
  const token = trimmed.startsWith("wd:") ? trimmed.slice(3) : trimmed;
  return /^[a-f0-9]{64}$/.test(token) ? token : null;
}
