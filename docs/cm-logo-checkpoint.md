# C/M wedding identity — approved 9 October 2026

> **Superseded — 12 October 2026:** The owner clarified that the logo discussion concerned the management website. Removed the invitation editor toggle and all C/M rendering from the opening, header and closing. The theme parser ignores the old `wedding_mark` setting, so previously saved invitations cannot re-enable it. Original artwork and historical review assets are preserved. The `/dev/review?view=cm-logo` fixture now serves as a legacy-setting fallback check, not an active logo feature. The old logo-placement browser script is historical and no longer describes expected behavior.

Use all three treatments: framed logo on opening, small unframed C/M in header, one faint framed watermark in closing section. Use the original provided artwork, not an AI-redrawn logo. Preserve existing photos and content. C/M is optional per invitation through existing theme JSON; it must not appear on unrelated couples' pages. No schema changes.

Assets: source SVG contains a 405 x 500 embedded PNG, not vector paths. `cm-crest.png` extracts that exact embedded image without altering pixels. `cm-monogram.svg` crops the same embedded image to its inner letterforms through its viewBox. CSS masks render the white source artwork in slate-grey without changing its shapes. Original supplied file remains unchanged.

The earlier image concepts remain review references. This production slice applies the logo placements to the existing Classic invitation, preserving its opening, photos and sections rather than replacing the entire template with the generated composition.

Per-invitation setting: `wedding_mark: "cm" | null`, default null. Editor control saves through the existing invitation theme action. Preview fixture uses fictional C/M content at `/dev/review?view=cm-logo`; no live invitation content is written by the implementation task.

Validation: pending.

## Implementation and verification

Completed the invitation-specific C/M setting and the three requested placements. The header uses a light background for consistent slate monogram contrast over any cover photo. The opening retains the existing botanical/bow animation and includes the framed crest above the names. The closing watermark is 6.5% opacity, decorative, non-interactive, and appears exactly once. On mobile it sits below the closing text rather than behind the message. Reduced-motion and unbranded paths retain their behavior.

Production build including TypeScript passed. Browser checks passed for desktop 1440x1000 (animated opening), mobile 390x844 and short landscape 844x390 (reduced motion), plus the unbranded fallback: no horizontal overflow, no opening overlap with the names/ribbon, no React/hydration errors, focus/inert state restored after opening. Screenshot evidence is under design-review/cm-logo. Final contrast and lint recheck pending below.

Enable in Invitation → The essentials → Use the C/M wedding logo, then save. A working local preview with fictional content is available at /dev/review?view=cm-logo. No live database writes or deployment were performed.

Final verification: PASS after the closing text-contrast adjustment. Browser suite passed again; lint passed with zero errors and nine existing image warnings. Temporary logo-inspection script removed after use. No changes to database schema, live invitation content or external delivery.
