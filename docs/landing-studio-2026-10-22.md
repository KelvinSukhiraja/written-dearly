# Written Dearly — studio landing page

22 October 2026. Owner requested implementation of a minimal, modern editorial landing page, informed by the supplied floral-paper image, gallery atlas, minimal-concept video and src/app/icon.png monogram.

## Accepted direction

Revision 2: owner found the first implementation too basic and insufficiently stylish. Replacing the conventional split hero with a full-width typographic composition, a dimensional monogram seal, opposing scroll-driven title movement, an expanding photographic scene with an invitation study, and a restrained oversized closing. Preserve the short service/account scope. V1 source is archived in the isolated review folder.

Short service-led page: expressive hero, compact service introduction, closing account invitation. Studio positioning; no pricing, testimonials or large feature catalogue. Primary action goes to /signup; existing members use /login, whose existing flow leads to /dashboard. Preserve authentication behavior.

Warm paper, slate-blue monogram accent, local serif typography and generous negative space. Dramatic GSAP entrance followed by continuously scrubbed image parallax, typographic drift and gentle reveals. Native scrolling; touch scrolling and keyboard navigation remain available. Reduced-motion mode presents a complete static composition. Content stays readable without JavaScript.

## Review and implementation

Isolated responsive structure reference: design-review/studio-landing-2026-10-22/index.html. Production slice limited to the public homepage and its own component/styles. No live data or infrastructure changes. Images are atmosphere, not a claim that pictured stationery is a purchasable product. No data-loading, empty or submit-success states apply to this static page; account forms retain their existing states.

## Verification checkpoint

- Final production build passed, including TypeScript and static generation.
- Targeted ESLint passed for the homepage and landing component.
- Browser review at 320, 390, 768 and 1440 CSS-pixel iframe widths; normal desktop preview also inspected. Fixed the 320px hero title wrapping during review. Desktop evidence: design-review/studio-landing-2026-10-22/desktop.png.
- Scrolled through service and closing sections; verified signup CTA opens the existing signup form, and sign-in navigation opens the existing login form. Returned to the homepage successfully.
- Reduced motion is implemented through GSAP matchMedia with cleanup; source-reviewed, not emulated in this browser session. No real-device performance benchmark or authenticated account submission was performed.
- Existing local development server on port 3000 reused. No deployment, schema or infrastructure change. Existing unrelated working-tree edits and deleted historical review files were left as found.

Implementation: src/app/page.tsx and src/components/landing/studio-landing.tsx with scoped studio-landing.module.css. Previous landing styles remain preserved. Future work: owner visual feedback, then deployment when requested.

## Revision 2 verification

Replaced the original split hero with oversized Awesome Serif typography, a dimensional monogram seal, opposing scroll movement, expanding floral imagery, a floating invitation study, and an olive closing. Targeted ESLint passed. Browser inspected at the normal desktop preview width and at 390 and 320 CSS pixels, including the narrow-screen photographic section and closing. Reduced-motion remains source-reviewed rather than browser-emulated. Earlier 768/1440 checks above refer to revision 1. No deployment performed.
Revision 2 production build passed, including TypeScript and static generation.
