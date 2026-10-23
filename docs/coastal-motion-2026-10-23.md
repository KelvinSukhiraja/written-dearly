# Coastal motion — 23 October 2026

## Final approved motion and release scope — 24 October 2026

Owner approved deployment after local review. This summary supersedes earlier experimental title and opening descriptions below. Names use the original gentle text reveal; all spiral, bend and offscreen-name experiments were removed. The ampersand uses the exact Awesome Serif glyph outline, revealed by a fitted continuous pen mask with GSAP easing. A flat pen tip and tighter mask reduce early corner fragments. The mask is removed after the stroke finishes to preserve the complete original glyph. Writing leads the name entrance slightly. Reduced motion renders the complete static glyph.

The opening card expands to fill the viewport before dissolving into the hero. Menu opens and closes as matching curtains. Includes individual text/component/gallery reveals, photo/leaf parallax, gentle native proximity snapping, visible hero date and keyboard/reduced-motion behavior. Gift/Wishes sample content remains local development-only. Release includes only the four Coastal template source files; unrelated dashboard, editor and configuration changes are excluded.

Final handwriting progress and unclipped completion were checked in Edge. Production-build and deployment verification are recorded below when complete.

## Owner revisions — 24 October 2026

Supersedes the original opening/date/menu-exit descriptions below. The opening card now enlarges to cover the viewport, then dissolves into the hero; removed the photographic sweep and rotation. Menu exit reverses the same curved curtain used on entry. Removed the date's scroll tween, which competed with its entrance opacity and made it look missing; the date retains its final full opacity after entering.

The linked `mode=content` development preview lacked gift details and wishes, so those sections were not rendered. Added clearly fictional gift details, sample wishes and dress-code content to that mode only. Production visibility conditions remain unchanged. Gift text/button/logo and Wishes heading/intro/list have scroll entrance animations. Verification script: design-review/coastal-motion/revisions.cjs.

Owner requested a richer animated opening, animated menu, tasteful text and component reveals, more parallax, individually arriving gallery photographs and safe section snapping. This authorizes the local production slice; no schema changes or deployment are included.

Implemented in coastal-motion.ts, coastal.tsx and coastal.css:

- Staggered opening-card entrance; opening text lifts away, the card tilts/expands and the photographic curtain sweeps upward with a curved edge. Hero names arrive in sequence underneath.
- Menu curtain entrance, staggered links, animated exit before navigation and smooth native anchor scrolling. Escape/close restore focus; rapid closing is guarded and animation cleanup runs on unmount.
- Separate typography, portrait, event, form, gift, wishes and footer reveals. Gallery photographs lift and scale into place individually. Countdown columns and dress-code swatches arrive in sequence.
- Increased overscanned photo parallax, drifting hero title/date and leaf decoration. Static portrait/gallery clipping frames avoid image bleed. QR pass remains static.
- Native proximity snapping on the existing scroll surface, with section-start targets and normal scroll-stop behavior. Tall sections remain freely scrollable. Dialogs and focused form fields suspend snapping. No wheel interception, forced pagination or new nested scroll container.
- Reduced motion skips animation and snapping. Keyboard focus completes any enclosing reveal immediately. Optional empty content retains the existing layout and behavior.

Verification completed on 24 October using the fictional development fixture. Edge checks pass at 320×568, 390×844 and 1280×900 with motion, plus 390×844 with reduced motion: opening completion, menu Escape/focus restoration, anchor navigation, all ten photos reachable, tall-section free scrolling and no horizontal overflow or page errors. Screenshots are saved alongside design-review/coastal-motion/verify.cjs; phone opening, details and gallery images were visually inspected.

Additional edge checks cover empty content, rapid menu close/reopen, menu navigation before opening, focused form visibility/snap suspension and live reduced-motion changes. These found a hidden destination heading when navigating before opening; the focus handler now completes both enclosing and descendant reveals for a focused section. Normal scroll reveals remain separate.

Scoped ESLint and TypeScript checks passed during implementation. No real guest data or responses are used. Physical iPhone Safari remains unverified. Changes are local and have not been deployed. Preview at http://localhost:3000/dev/coastal?mode=content.

Revision verification: scoped lint, TypeScript and Edge checks at 320, 390 and 1280 widths pass. Verified full-opacity date before/after scrolling, card-fill opening completion, curtain close, and gift/wish reveals. Visually reviewed the 320px opening and hero screenshots. The initial desktop run clicked before hydration; rerun after page loading passed. Physical Safari remains untested; local only.

Release verification: exact isolated production Webpack build passes, including TypeScript, page-data collection and route generation. Scoped ESLint passes. Final Edge regression checks pass empty invitations, menu close/reopen, navigation before opening, focused form visibility and reduced motion. Fixed SVG query-selector typing during production verification. No database or external delivery changes.
