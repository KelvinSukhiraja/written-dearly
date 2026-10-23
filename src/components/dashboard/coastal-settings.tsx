"use client";

import {
  coastalPalettes,
  type DressColour,
  type VendorFooter,
} from "@/lib/invitations/coastal-options";
import { MediaUpload } from "./media-upload";

export function CoastalPaletteEditor({
  colors,
  onChange,
}: {
  colors: DressColour[];
  onChange: (colors: DressColour[]) => void;
}) {
  const preset = coastalPalettes.find(
    (p) =>
      p.colors.length === colors.length &&
      p.colors.every(
        (c, i) => c.name === colors[i].name && c.color === colors[i].color,
      ),
  );
  return (
    <fieldset className="min-w-0 space-y-4">
      <legend className="mb-3 font-medium">Dress-code colour palette</legend>
      <p className="text-sm text-muted">
        Choose a palette or customise up to six swatches. These colours guide
        guest attire.
      </p>
      <label className="field">
        Palette
        <select
          className="input"
          aria-label="Palette"
          value={preset?.name ?? "custom"}
          onChange={(e) => {
            const selected = coastalPalettes.find(
              (p) => p.name === e.target.value,
            );
            if (selected) onChange(selected.colors.map((c) => ({ ...c })));
          }}
        >
          {coastalPalettes.map((p) => (
            <option key={p.name}>{p.name}</option>
          ))}
          <option value="custom" disabled>
            Custom palette
          </option>
        </select>
      </label>
      {colors.map((c, i) => (
        <div key={i} className="flex flex-wrap items-end gap-3">
          <label className="field">
            Colour {i + 1}
            <input
              type="color"
              className="h-11 w-14 cursor-pointer"
              value={c.color}
              onChange={(e) =>
                onChange(
                  colors.map((v, n) =>
                    n === i ? { ...v, color: e.target.value.toUpperCase() } : v,
                  ),
                )
              }
            />
          </label>
          <label className="field min-w-0 flex-1">
            Colour {i + 1} name
            <input
              className="input"
              value={c.name}
              maxLength={40}
              onChange={(e) =>
                onChange(
                  colors.map((v, n) =>
                    n === i ? { ...v, name: e.target.value } : v,
                  ),
                )
              }
            />
          </label>
          <button
            className="btn btn-secondary"
            type="button"
            aria-label={`Remove colour ${i + 1}`}
            disabled={colors.length <= 1}
            onClick={() => onChange(colors.filter((_, n) => n !== i))}
          >
            Remove
          </button>
        </div>
      ))}
      <button
        className="btn btn-secondary"
        type="button"
        disabled={colors.length >= 6}
        onClick={() =>
          onChange([
            ...colors,
            { color: "#D5CABC", name: `Colour ${colors.length + 1}` },
          ])
        }
      >
        Add colour
      </button>
    </fieldset>
  );
}

export function CoastalFooterEditor({
  footer,
  onChange,
  userId,
  invitationId,
  previewOnly,
  onBusy,
}: {
  footer: VendorFooter;
  onChange: (footer: VendorFooter) => void;
  userId: string;
  invitationId: string;
  previewOnly: boolean;
  onBusy: (busy: boolean) => void;
}) {
  return (
    <div className="space-y-6">
      <h2>Coastal footer</h2>
      <p className="text-sm text-muted">
        The brown footer keeps the reference layout: vendor logo or name,
        copyright, then WA and IG. Leave a link blank to hide it.
      </p>
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={footer.enabled}
          onChange={(e) => onChange({ ...footer, enabled: e.target.checked })}
        />
        Show vendor identity and social links
      </label>
      <label className="field">
        Vendor name (also used as logo description)
        <input
          className="input"
          value={footer.vendor_name}
          maxLength={100}
          onChange={(e) => onChange({ ...footer, vendor_name: e.target.value })}
        />
      </label>
      <fieldset disabled={previewOnly} className="min-w-0">
        <MediaUpload
          label="Vendor logo"
          value={footer.logo_url}
          onChange={(logo_url) => onChange({ ...footer, logo_url })}
          userId={userId}
          invitationId={invitationId}
          preview="original"
          imagePurpose="logo"
          onBusy={onBusy}
        />
      </fieldset>
      <p className="text-sm text-muted">
        Use a transparent PNG or WebP for a logo on the brown footer. Logo
        images can be smaller than invitation photos.
      </p>
      {(
        [
          ["whatsapp_url", "WhatsApp link", "https://wa.me/628123456789"],
          [
            "instagram_url",
            "Instagram link",
            "https://www.instagram.com/yourvendor/",
          ],
        ] as const
      ).map(([key, label, placeholder]) => (
        <label key={key} className="field">
          {label}
          <input
            type="url"
            className="input"
            value={footer[key]}
            placeholder={placeholder}
            onChange={(e) => onChange({ ...footer, [key]: e.target.value })}
          />
        </label>
      ))}
      <p className="text-sm text-muted">
        Save the invitation to publish these options. Turning this off hides the
        vendor and social links while keeping copyright.
      </p>
    </div>
  );
}
