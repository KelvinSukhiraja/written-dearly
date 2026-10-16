# Living design wall — 15 October 2026

## Approved direction

The owner approved a modern boutique design-studio landing page and a signature scroll-driven living design wall, after explicitly reviewing the concept. Supersedes the earlier workspace-like landing theme, preserved in this folder as previous-page.tsx.txt and previous-styles.css and in the earlier screenshots.

An ivory/ink/cobalt editorial composition introduces the product with oversized type and a visible account action. Native scrolling briefly holds the hero while typography, a photograph and note cards converge into an invitation. Decorative notes dissolve, leaving the assembled composition. The scene releases into a scroll-linked text ribbon, two illustrative design studies, a three-step product story and final account action. C/M branding remains in the site header/footer, not on guest invitations.

## Behavior and boundaries

- CSS sticky controls the scene; scroll listeners only update decorative transforms once per animation frame. No wheel/touch interception, scroll lock, forced playback or timers.
- Mobile uses a shorter sequence and smaller artwork. Short viewports use normal flow. Reduced-motion preference removes the sticky travel, entrances and hover motion; it also responds to runtime preference changes.
- Without JavaScript, the assembled card and all content/links remain visible. Server-side authentication and account routing are retained.
- Existing supplied Coastal photography and botanical art are reused. Names and date are fictional and compositions are labelled illustrative. Coastal is labelled a design preview; no claim of live catalog activation. No fake RSVP controls or live guest information.
- Only the landing page, its scoped CSS module and a small client motion wrapper changed. No invitation renderer, schema, delivery infrastructure or live invitation setting changed.
- Cleanup removes scroll/resize/preference listeners and disconnects resize/intersection observers on navigation.

## Verification

Initial browser pass: desktop 1440px, tablet 768px, mobile 390px and 320px at 900px height. Captured start, midway, assembled and showcase frames. Distinct photo transforms confirm scroll progress. No horizontal overflow or browser console/page errors. Final account action remained available. Reduced motion, keyboard skip-to-main, 650px short viewport fallback and JavaScript-disabled content passed. Desktop/mobile frames visually inspected.

Final verification: targeted ESLint passed. Production build and its TypeScript check passed outside the Windows sandbox after sandbox compilation stalled and was stopped. The full browser suite passed again after the ribbon and showcase polish, including no-JavaScript content and no console/page errors. Screenshots are saved alongside this reference. Signed-in routing is preserved in code but was not exercised with a real account. No deployment performed.
