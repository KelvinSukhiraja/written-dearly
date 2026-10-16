# Coastal invitation — Figma implementation

Source: https://www.figma.com/design/3C0yYAlzF44FnaevtIemRP/Wedding-Invitation?node-id=0-1

Figma MCP context and screenshots retrieved for opening (1:2), home (17:43), couple (18:91), countdown (18:123), details (19:166), RSVP (22:308), gallery (23:481), gift (23:520), wishes (24:669), footer (24:701), menu (24:713). Original 402px mobile composition; desktop keeps a centred invitation column.

Implement as a second renderer named Coastal, preserving Classic. Reuse existing RSVP submission, guest allowance, event visibility and QR pass components. Opening, navigation, photo lightbox and gift copy controls are interactive. Names/photos/events stay dynamic. Figma's account information and example wishes belong only in an isolated design reference, not as defaults for couples.

Initial font gap resolved: the user supplied Awesome Serif and Gotham in public/fonts. The renderer loads AwesomeSerif-Regular, AwesomeSerifItalic-Regular and Gotham Book. Per-event attendance and public wishes are not supported by the approved live data/privacy model. Do not silently publish private messages or pretend to save per-event attendance. Live template catalog registration requires a separate checkpoint; the insert is prepared without applying it.

Artwork downloaded using Figma-provided URLs and curl; manifest in design-review/coastal-figma/assets.json. Do not reference temporary URLs at runtime. No schema, policy or published invitation changes authorized here.

## Implementation and verification

- New scoped Coastal renderer and design metadata; Classic remains available. Owner-only preview now resolves the selected renderer and accepts a supported design override without saving it. Design picker exposes a Coastal preview while catalog registration is pending.
- Reference page: `/dev/coastal` (development only). Uses the supplied design's names/photos, fictional guest wishes and a dummy bank account. `?mode=preview` exercises production preview with three gallery images; `?mode=empty` exercises incomplete details. These routes do not submit responses.
- Production reuses ClassicRsvp (private guest response, allowance/deadline/closed handling), YouTube playback and reception pass. The Figma per-event response fields, bank copy card and public wish wall are reference-only pending data model/consent work. Existing generic gift/detail text remains visible in production without guessing account numbers. Social links without supplied destinations are replaced by Written Dearly and Back to top.
- Downloaded original SVG dimensions preserved; photos use next/image optimization. Gallery height fits fewer than ten photos. Photo assets and three local font faces loaded in browser.
- Browser checked at 320×740, 402×874 and 1280×900: portrait column, no horizontal document overflow, opening/menu, anchor navigation, local RSVP yes/no and party count, safe preview message, lightbox next/Escape, gift copy success, empty details. No browser console errors observed. No real RSVP submitted or invitation shared.
- Production build passed after retrying outside the Windows filesystem sandbox. TypeScript passed after final renderer/fixture changes; targeted ESLint passed. No live database change or catalog insertion performed.

## GSAP motion pass

User requested animations suited to the design. Added a 1.15-second opening-card reveal, a quiet 0.8-second opening dissolve, slow 4% photo settling, gently staggered names, one-time scroll entrances (18px, 0.95 seconds), portrait reveals and a short stagger in the menu. No looping motion, scroll pinning or scroll interception. Native scrolling, form behavior and the original composition remain intact.

The motion hook uses scoped useGSAP cleanup and gsap.matchMedia. Reduced-motion mode leaves all content visible and removes the opening immediately; switching preferences reverts active motion. Focusing a control completes its enclosing reveal. Resize/font changes refresh section positions; route changes clean up observers, listeners and ScrollTriggers. Reference: https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/

## Expanded motion and parallax

At the user's request, added scroll-linked photo parallax to the cover, portraits and gallery: clipped images overscan by 12–14% and travel from -3% to +3%, with eased scrub catch-up. The hero title moves independently by 36px; the botanical illustration drifts 48px and rotates four degrees through its section. Added a countdown entrance and subtle pointer-only hover shadows. All new effects participate in reduced-motion cleanup; no scroll pinning, hijacking or infinite loops. Browser checks confirmed changing hero/portrait transforms, independent title movement, completed opening removal, and no console warnings/errors. Existing data behavior and live activation status are unchanged.

## Gallery viewer redesign

Replaced the generic cream dialog with a dedicated full-screen charcoal photo viewer. The image uses contain sizing with a restrained editorial header, discreet caption, counter, circular navigation and a close control. Mobile controls stay below the image and within safe areas. Supports arrow keys, Escape, horizontal touch swipes, loading/error messages and reduced-motion-aware image reveals. Native modal focus containment, scroll locking and focus restoration remain intact. Browser checks covered desktop and 390×844 layout, next/previous keyboard controls, Escape/focus restoration and viewport bounds. No console errors observed. Shared application dialogs are unchanged.

## Catalog registration (pending)

`supabase/proposals/register-coastal-template.sql` inserts only the Coastal catalog entry if absent. It does not switch any couple's selected design, alter guest data, or publish an invitation. Await separate approval before applying it. Full public wishes/per-event attendance/gift account editing are separate feature decisions.
