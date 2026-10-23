export type DressColour = { name: string; color: string };
export type VendorFooter = {
  enabled: boolean;
  vendor_name: string;
  logo_url: string;
  whatsapp_url: string;
  instagram_url: string;
};

export const coastalPalettes = [
  {
    name: "Coastal neutrals",
    colors: [
      { name: "Beige", color: "#D5CABC" },
      { name: "Brown", color: "#493022" },
      { name: "Taupe", color: "#645A4D" },
      { name: "Black", color: "#130E07" },
    ],
  },
  {
    name: "Garden greens",
    colors: [
      { name: "Ivory", color: "#F1EBDD" },
      { name: "Sage", color: "#A2AD91" },
      { name: "Olive", color: "#727B54" },
      { name: "Forest", color: "#344B3B" },
    ],
  },
  {
    name: "Ocean blues",
    colors: [
      { name: "Pearl", color: "#E6E6DF" },
      { name: "Mist", color: "#B4CCD2" },
      { name: "Slate blue", color: "#6C8B9B" },
      { name: "Navy", color: "#283F56" },
    ],
  },
  {
    name: "Warm sunset",
    colors: [
      { name: "Champagne", color: "#E7D2AE" },
      { name: "Blush", color: "#D5A69C" },
      { name: "Terracotta", color: "#B76E51" },
      { name: "Burgundy", color: "#6C3440" },
    ],
  },
] satisfies { name: string; colors: DressColour[] }[];

export function parseDressColours(value: unknown): DressColour[] {
  if (!Array.isArray(value))
    return coastalPalettes[0].colors.map((c) => ({ ...c }));
  return value.slice(0, 6).flatMap((v, i) => {
    if (
      !v ||
      typeof v !== "object" ||
      typeof v.color !== "string" ||
      !/^#[\da-f]{6}$/i.test(v.color)
    )
      return [];
    return [
      {
        color: v.color.toUpperCase(),
        name:
          typeof v.name === "string" && v.name.trim()
            ? v.name.trim().slice(0, 40)
            : `Colour ${i + 1}`,
      },
    ];
  });
}

export function vendorSocialUrl(
  value: unknown,
  kind: "whatsapp" | "instagram",
): string {
  if (typeof value !== "string" || !value.trim()) return "";
  try {
    const url = new URL(value.trim());
    const hosts =
      kind === "whatsapp"
        ? ["wa.me", "api.whatsapp.com", "www.whatsapp.com", "whatsapp.com"]
        : ["instagram.com", "www.instagram.com"];
    return url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      !url.port &&
      hosts.includes(url.hostname)
      ? url.href
      : "";
  } catch {
    return "";
  }
}
