# Original Invitation Index — 15 October 2026

The owner explicitly approved implementing the original generated Invitation Index, not the later SaaS/pricing composite. This supersedes the living design wall. Scope: header, invitation headline, nine-image horizontal inspiration gallery, oversized Written Dearly wordmark, and floral/story section. Further sections and the catalogue/pricing/signup-selection journey remain deferred.

Reference and history: `design-review/invitation-index/approved-reference.png`, with previous landing source preserved alongside it. Generated production assets: `public/landing-index/gallery-atlas.png` and `public/landing-index/floral-paper.png`. Built-in imagegen produced both from the approved concept. Prompts are summarized in the review README. Illustrative names and imagery are not customer content or claims of selectable templates.

The gallery enlarges the selected image and translates its neighbours. It supports clicking, labelled previous/next buttons, arrow/Home/End keys with focus following selection, and directional touch swipes without preventing native vertical scroll. No autoplay. Entry/reveal motion and slight floral parallax respect runtime reduced-motion changes. Without JavaScript, the initial composition and navigation remain visible. Observers/listeners clean up on navigation.

Self-hosted Bodoni Moda normal/italic fonts come from the Google Fonts repository, licensed under SIL OFL with the license saved at `public/fonts/bodoni-moda/OFL.txt`. Font source: https://github.com/google/fonts/tree/main/ofl/bodonimoda . No runtime external font dependency.

Explore invitations currently uses existing signup for anonymous users and the existing dashboard design chooser for signed-in users. Dedicated public catalogue, pricing and purchase are not part of this slice. No auth/backend/schema or public invitation renderer changes.

Verification: targeted ESLint passed. Initial production build including TypeScript passed. Browser checks at 1440, 1024, 768, 390 and 320px passed gallery controls, keyboard wrapping, touch, reduced motion, skip link and no-JavaScript visible content without console errors. Final font-boundary check and build recorded in the review README. Local implementation only, not deployed.
