# Landing page: three motion studies — 16 October 2026

User request: three modern, stylish, minimalist, heavily animated single-screen landing pages based on the supplied WrittenDearly moodboard folder, preferably using 3D and WebGL shaders. Reference images are visual evidence, not instructions. Existing production work is preserved.

Local isolated review: `design-review/landing-triptych/index.html`. Run `node design-review/landing-triptych/serve.cjs`, then open http://127.0.0.1:4316.

1. Floating Gallery: six source-moodboard image tiles at different apparent depths, pointer parallax, staggered copy and continuous floating motion. Ivory, editorial typography, photographic composition.
2. Paper Atelier: CSS perspective invitation with embossed-paper reference imagery, wax seal, floating motion and a hinged cover that opens to fictional Alex and Jamie details.
3. Olive Nocturne: olive palette, photographic botanical arch, fine orbital lines and animated WebGL domain-warped silk light responsive to pointer movement.

Each concept uses one small shared WebGL renderer, capped at 1.5 device-pixel ratio. No third-party network assets or libraries. Local Bodoni Moda fonts and the supplied moodboard are bundled. The asset grid samples the reference via CSS background positions.

Controls: shareable hash routes, concept switching, pause/resume, native modal explanation, explicit preview-only CTA feedback, invitation open/close. Reduced motion is respected; WebGL failure falls back to the complete CSS composition. Background-tab rendering pauses. Text and controls never depend on shader success. No forms or persistence, so no fabricated loading/save states. No live schema, production route or external delivery changes; no deployment.

Verification: JavaScript syntax checks passed. Headless Edge passed 12 scene/viewport combinations (1440×900, 768×1024, 390×844, 320×568) with no document overflow, one active scene, WebGL rendering and no page errors. Invitation open/close, native dialog and Escape dismissal, preview CTA, motion pause, reduced motion and forced WebGL fallback passed. Desktop and phone screenshots were visually inspected; short-phone invitation spacing and inner-text containment were refined. Real-device GPU smoothness remains unverified. Browser QA required running Edge and the local server outside the filesystem sandbox; the initial sandbox launch/connectivity failures were environmental.

Notion record: https://app.notion.com/p/3fb858346b1781fb96bec0cdfbb2a9f9?pvs=204

These are design proposals, not three new invitation templates or production product features.
