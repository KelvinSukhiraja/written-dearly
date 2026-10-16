# Written Dearly — botanical invitation opening

The supplied Next.js template with an original embroidered botanical cover, transparent silk bow artwork, and a GSAP opening. No video, canvas, Three.js, or external animation service is used.

## Run locally

Use Node.js 20.9 or newer and pnpm. From this folder:

```sh
pnpm install
pnpm dev
```

Open http://localhost:3000. For a production build: `pnpm build`, then `pnpm start`.

## Add it to Written Dearly

1. Install `gsap` in the destination Next.js project (`pnpm add gsap`).
2. Copy `components/invitation-opening.tsx` and `components/invitation-opening.css`.
3. Copy `public/invitation-art/botanical-linen.webp` and `public/invitation-art/silk-bow.webp` to the same public folder in your project. Original PNG masters are also supplied; they are not loaded by the website.
4. Wrap your invitation page:

```tsx
import { InvitationOpening } from '@/components/invitation-opening'

export default function InvitationPage() {
  return (
    <InvitationOpening
      firstName="Eleanor"
      secondName="James"
      date="October 18, 2025"
      invitationId="eleanor-james"
      oncePerSession={false}
    >
      <main>{/* Your existing invitation */}</main>
    </InvitationOpening>
  )
}
```

The component imports its own stylesheet and is already a client component. The supplied `app/page.tsx` demonstrates the integration. Keep the wrapper mounted for the lifetime of a single invitation; if switching invitations in-place, use `key={invitationId}`.

The intro plays on each visit by default, suitable for template previews. Set `oncePerSession` to `true` to remember opening or skipping for that invitation in the current browser tab session. Storage failures do not block access.

`artworkSrc` and `bowSrc` accept custom asset URLs. Names and date are live HTML, not part of the generated images. Theme colors, positioning, and responsive artwork fitting are in the component stylesheet.

## How the motion works

- One continuous botanical image is displayed through two half-width cover panels.
- The transparent bow is displayed through two CSS masks, with a separate CSS silk band underneath. GSAP pulls the bow halves away and retracts the band. This is a stylized ribbon release, not a physically simulated untying.
- CSS perspective and GSAP `rotationY` hinge the covers outward. Animated shading adds depth.
- The original homepage becomes visible as the covers move. Elements matching `.hero-content > *`, `.nav`, and `.scroll-cue` fade upward in a stagger. Adapt these selectors if your destination template has different markup; the opening itself still works without them.
- Total sequence: approximately 4 seconds. Change timing in the `open` function.

## Interaction and accessibility

Open with click, tap, Enter, or Space. Skip remains available during playback; Escape also dismisses. The page is inert while the intro is active, keyboard focus is contained, scrolling is restored on completion, and focus moves to the page after dismissal. Reduced-motion preference bypasses the movement after opening; changing that preference during playback finishes immediately. Without JavaScript, a noscript rule hides the cover and leaves the original page readable.

## Validation

Production build and TypeScript validation passed. Browser checks covered desktop (1280×720), phone (390×844), and compact phone (320×568), normal completion, keyboard tab wrapping, Skip during playback, restored scrolling, restored page interactivity, and absence of horizontal overflow at 390px. Reduced-motion and session-memory branches are implemented; they were not separately emulated in the browser verification.

## Existing template notes

The supplied names, wedding date, photos, page sections, and RSVP flow are retained. The sample date is in the past, so its countdown displays zero: update the `invitation` object in `app/page.tsx` and footer copy for your event. The original RSVP is a frontend-only demo; it does not persist replies. Connect it to Written Dearly's existing backend before using it for guests. A countdown initialization was adjusted to avoid server/client timestamp mismatches. TypeScript build errors are no longer ignored.

The original template's remote photos and production analytics remain as supplied. This folder has not been deployed or connected to the actual Written Dearly repository.

See `ARTWORK-PROMPTS.md` for the generation prompts and asset provenance.
