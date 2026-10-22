# Consistent arrow icons — 22 October 2026

Owner reported emoji-like arrows in the landing navbar/footer login links, invitation previews and invitations. All navigation/action arrow glyphs in application React components now use a shared decorative SVG, inheriting text size and color without platform emoji/font substitution. Existing custom landing CTA SVGs remain intact.

Covered controls: navbar/footer login, back to top, invitation open/skip, map/detail links, RSVP submit/update, gallery previous/next, pass download, owner preview/full-page links and related dashboard navigation. Labels, destinations and pending behavior are preserved. Preview back-link spacing and responsive navbar icon dimensions are explicit.

Verification: TypeScript passes; targeted ESLint has zero errors and eight existing image warnings. Headless Edge checked landing, fictional invitation and editor at 1440px and 390px: no visible text arrow glyphs, SVG icons present and no horizontal overflow. Screenshots are in `design-review/arrow-icons-2026-10-22/`; desktop footer and mobile invitation opening were visually inspected. Local implementation only; no deployment performed. Historical design prototypes and the separate email template were preserved.
