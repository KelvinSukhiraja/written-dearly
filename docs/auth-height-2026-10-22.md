# Login viewport fit — 22 October 2026

Owner reported that login did not fit one screen. Live measurements reproduced 650px document height at 1280×600 and 690px at 375×667/320×568. The earlier verification checked horizontal overflow at tall viewports, missing this vertical case.

Keep the established dashboard styling and artwork. Reduce outer padding, panel padding, decorative crest size and vertical gaps below 740px viewport height; use a tighter form below 600px on narrow screens. Preserve 46px inputs/buttons and 16px input text. Leave natural document scrolling available for keyboard/landscape, errors, signup and enlarged text rather than clipping content.

Production build including TypeScript passes. Browser height checks pass login at 1440×900, 1366×768, 1280×600, 1024×600, 768×600, 390×667, 375×667, 390×844 and 320×568. Sign in and Create an account are within the viewport. Login/signup controls remain reachable by scrolling at 667×375. The 320×568 screenshot was visually inspected. Runner: `scripts/verify-auth-height.mjs`; screenshots: `design-review/auth-2026-10-21/height-local-*.png`.

Deployment follows through the existing main-branch Vercel integration, as authorized for the login update. No authentication actions, data or infrastructure configuration changes.
