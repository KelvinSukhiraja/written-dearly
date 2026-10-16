# Landing page — living design wall

The owner approved the editorial design-studio direction and scroll-driven landmark animation on 15 October 2026 before development. This supersedes the earlier restrained workspace-style landing page, while preserving its reference.

Implementation: ivory, ink and cobalt; oversized serif typography; C/M signature; a collage of photography, notes and invitation typography that assembles during a short sticky scroll sequence. Followed by a moving text ribbon, illustrative design showcase, three-step product story and closing account action. Uses native scrolling with shorter mobile motion and static reduced-motion/no-JavaScript fallbacks. Existing supplied design artwork is reused with sample names. Coastal remains labelled a preview.

The main action is visible immediately and existing authenticated/anonymous routing remains unchanged. No live schema, infrastructure or invitation-renderer changes. Requirements and approval recorded in the Notion second brain.

Full interaction details, preserved prior version and verification evidence: `design-review/landing-living-wall/README.md`. This is a local implementation, not a deployment.

Verification completed: production build, TypeScript and targeted lint passed. Browser checks at 1440, 768, 390 and 320px verified distinct scroll transforms and no overflow or console errors; keyboard, reduced-motion, short-screen and no-JavaScript fallbacks passed. Desktop/mobile screenshots inspected. Signed-in account routing was retained but not browser-tested with a real session.
