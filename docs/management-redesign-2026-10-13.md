# Management website redesign

## Invitation polish and actual desktop scale — 14 October 2026

Supersedes the density-only adjustment below: desktop management workspace now uses actual 0.7 CSS zoom at widths of 1024px and above; mobile remains at normal scale. Removed the earlier density overrides so reductions do not compound. Verified desktop sidebar scales to 168px, fills viewport height, and has no horizontal overflow; 390px mobile remains zoom 1.

Reviewed all invitation editor sections. Replaced the technical crop percentage with Adjust cover photo, directional guidance, accessible value text and a Centre photo reset. Marked names/date as required to publish, clarified optional fields, preview/save guidance, publishing visibility and RSVP deadline/closure behavior. Simplified story, gallery, music and guest-information labels; removed duplicate gallery removal controls. Verified slider changes and reset to 50% in a fictional fixture without saving. Public content and stored media are unchanged. TypeScript passed and targeted lint has no errors (two existing img optimization warnings).

## Photo preview correction

Removed the editor's universal landscape crop. Cover uses one portrait phone example (390:844) with the saved vertical focal point; exact cover crop still varies with viewport. Couple portraits match the invitation's arched 4:5 images, story uses 4:5, and gallery uploads show uncropped originals with a note to inspect responsive gallery crops in the full preview. No source images, storage behavior or published content changed. TypeScript passed; live editor DOM verified 240×519px cover and the saved 28% focal point without modifying it.

## Compact desktop refinement

Owner requested a smaller desktop interface, suggesting roughly 70%. Reduced desktop spacing and heading sizes by about 25–30%, sidebar to 200px, controls to 36px minimum height, input text to 14px, and card/table padding. Kept browser zoom native and mobile input sizing at 16px / 46px minimum height. Browser verified the invitation editor at desktop and mobile without horizontal overflow. This is density styling, not a literal 70% transform; public invitations are unaffected.

## Mobile navigation and preview polish

Replaced the mobile native disclosure marker with an ellipsis-labelled More button and auto popover (Escape/outside dismissal). Removed the global preview header; invitation editing retains its contextual preview link. Preview now defaults to fitting the available width, with optional Phone/Tablet/Desktop simulation, an explicit scale caption, a back link, refresh and full-page opening. Removed the thick mock-device border and adapted the preview toolbar for narrow screens. TypeScript passed; browser checked fit sizing, device switching and Escape dismissal without horizontal overflow.

## Lighter palette refinement

Owner requested a lighter appearance after reviewing the implementation. Updated management-only CSS to near-white canvas, white cards/sidebar, pale blue-grey navigation and primary buttons, and softer divider lines. Slate text and visible input/button boundaries retain contrast. Browser-verified the live local check-in screen; primary button text contrast is above 7:1 and its boundary above 3:1 against white. Layout, logo artwork and application behavior are unchanged. The earlier ivory/slate reference remains preserved as the first design checkpoint.

Authorized 13 October 2026. Scope: private couple workspace, including home, invitation editor, guests, check-in and shared secondary screens. Public invitations remain unchanged. Preserve existing guest, RSVP, sharing, storage and check-in behavior.

Direction: original C/M artwork, ivory canvas, slate ink, fine warm-grey rules, restrained rounded surfaces. Serif display titles recall the logo; system sans-serif provides legibility in controls and data. Use monogram in navigation, framed crest on the home welcome panel, and one faint decorative crest in the home footer. No imagery or invented wedding information.

Apple Design MCP searches and page reads completed for typography, layout, navigation and accessibility. Apply hierarchy, related-item grouping, predictable navigation, progressive disclosure and accessible contrast. Web-specific implementation: semantic navigation, aria-current, skip link, visible keyboard focus, 44px controls, responsive layout, text wrapping and reduced motion. Native Apple platform measurements/materials are not copied mechanically.

Sources: https://developer.apple.com/design/human-interface-guidelines/typography , https://developer.apple.com/design/human-interface-guidelines/layout , https://developer.apple.com/design/human-interface-guidelines/navigation-and-search , https://developer.apple.com/design/human-interface-guidelines/accessibility .

Isolated responsive layout/state reference: `design-review/management-2026-10-13/index.html`. Uses fictional content and includes loading, empty, error and success examples. Existing production-backed fictional fixtures remain at `/dev/review` for verification. No live data writes are required.

Implemented the management shell, desktop sidebar, four-destination mobile navigation, home next-step panel, progress strip and guest metrics. Shared forms, tables, dialogs, editor tabs, status badges and buttons now use the ivory/slate visual system. The original monogram, framed crest and faint decorative crest appear in the management workspace. Dialog dismissal restores focus to its trigger.

Verification completed: production build and TypeScript pass; all 10 existing guest-flow and YouTube tests pass. Browser fixtures checked at 1440, 768, 390 and 320px widths without document overflow in the inspected screens. Checked home, 125-row guest table/search, empty guest list, guest setup error, loading, add-guest dialog, editor/music selection, design selection and check-in. Escape closes the guest dialog and restores focus to Add guest. Contrast checked for text, primary buttons and input borders. Screenshots are in the adjacent design-review folder's screenshots directory.

These browser checks used fictional fixtures; no live contacts, invitation content, database schema or delivery settings were changed. This is a local implementation, not a deployment or a full accessibility audit. Existing guest-facing invitation designs are preserved.
