import type { GuestSide } from "@/lib/supabase/types";
import { normalizeGuestPhone, validGuestEmail, PHONE_ERROR } from "./contact.ts";
// RFC 4180 quoting, including commas, doubled quotes and multiline fields.
export function parseGuestCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [],
    field = "",
    quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (quoted && text[i + 1] === '"') {
        field += '"';
        i++;
      } else quoted = !quoted;
    } else if (c === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((c === "\n" || c === "\r") && !quoted) {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      if (row.some((v) => v.trim())) rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  if (quoted)
    throw new Error("A quoted field is not closed. Check the CSV file.");
  row.push(field);
  if (row.some((v) => v.trim())) rows.push(row);
  const headers = (rows.shift() ?? []).map((v) =>
    v
      .replace(/^\uFEFF/, "")
      .trim()
      .toLowerCase(),
  );
  if (!["name", "side", "phone"].every((key) => headers.includes(key)))
    throw new Error("CSV needs name, side and phone columns.");
  return rows.map((cols, index) => {
    const get = (key: string) => cols[headers.indexOf(key)]?.trim() ?? "";
    const side = get("side").toLowerCase();
    const count = Number(get("invited_count") || 1);
    if (
      !get("name") ||
      !["bride", "groom"].includes(side) ||
      !Number.isInteger(count) ||
      count < 1 ||
      count > 100
    )
      throw new Error(
        `Check the name, side and seat count on row ${index + 2}.`,
      );
    const phone = normalizeGuestPhone(get("phone"));
    if (!phone) throw new Error(`Row ${index + 2}: ${PHONE_ERROR}`);
    if (!validGuestEmail(get("email"))) throw new Error(`Row ${index + 2}: enter a valid email address.`);
    return {
      name: get("name"),
      side: side as GuestSide,
      group: get("group"),
      phone,
      email: get("email"),
      invited_count: count,
    };
  });
}
