# Invitation media setup — 12 October 2026

Status: user approved and live migration `invitation_media_storage` applied successfully on 12 October 2026.

Hosted inspection confirmed that `invitation-media` does not exist and there are no policies on `storage.objects`. The uploader already targets that bucket, uses `userId/invitationId/randomUUID.ext`, and creates unique files with `upsert: false`. This is why uploads show the administrator setup error.

Scoped proposal: `supabase/media_storage.proposal.sql`. Create a public media bucket limited to 6 MiB and JPEG/PNG/WebP/MP3/M4A/OGG MIME types, matching the existing form. Permit authenticated uploads only inside the user's UUID folder. No public listing, overwrite or deletion policy is added. A public bucket means anyone with a media URL can retrieve the file, including before the invitation is published; this matches the existing public URL implementation.

The proposal deliberately fails if the bucket already exists so it cannot silently change a later configuration. Do not apply the older broad production upgrade or storage script for this repair.

Verification: hosted bucket metadata matches all six MIME types and the 6 MiB cap. The signed-in editor uploaded the repository's botanical-linen artwork and displayed its public preview successfully. The test was discarded from the editor without saving; revisiting confirmed no unsaved changes and no cover. Hosted transaction tests confirmed owner insertion and denied cross-owner and anonymous insertion; object listing returns zero rows. Tests rolled back.

One unreferenced test object remains at `691ff62d-7d87-45b5-be02-e210d34f2e1b/ba615a31-04e6-410b-a9df-c3c64e72164c/be24c25b-6c69-4a3c-b68f-c2a34f41f445.webp`. Remove later through an administrative Storage API, not SQL metadata deletion. Current credentials do not provide object deletion; do not broaden access just for test cleanup. No saved invitation references this test object.

Security advisors reported the same pre-existing handle_new_user EXECUTE warnings and disabled leaked-password protection; no storage warning. Remediation: https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable , https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable , https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection .

## YouTube option

The Music section now offers No music / Upload a song / YouTube video. Existing settings default to uploads. A YouTube link is normalized to a single video and stored in existing theme JSON; no schema change needed. Unsupported or malicious hosts and malformed IDs are rejected. Selecting YouTube with an invalid/missing URL is rejected by the save action.

Guests see a soundtrack section with an explicit Load YouTube player button. The visible privacy-enhanced iframe has native controls, no autoplay, a close button that unmounts it, and an external fallback link. Only the site origin is sent as referrer, not the personal invitation path/token. Uploaded music is suppressed when YouTube or No music is selected; source switching preserves previous choices.

Verified in the isolated `/dev/review?view=youtube` fixture using YouTube's developer demo: iframe loaded, playback progressed with captions, and closing removed the player. The editor rejected a spoofed hostname and accepted a short YouTube link. Mobile editor screenshot: `design-review/media/youtube-music-mobile.jpg`. TypeScript and 10 unit/regression tests passed. The hosted couple's theme was not modified for YouTube testing.

YouTube reference: https://developers.google.com/youtube/terms/developer-policies (no hidden background player or separated audio) and https://developers.google.com/youtube/player_parameters .

Final checkpoint (13 October 2026): production build passed, including TypeScript and route generation. The initial sandbox build hit the known Windows path-access restriction; the authorized build outside the sandbox succeeded. Browser verification also confirmed a 245px × 200px player in the 390px mobile editor with no horizontal overflow. Temporary preview tabs were closed and the viewport override reset.

Reference: https://supabase.com/docs/guides/storage/security/access-control and https://supabase.com/docs/guides/storage/buckets/fundamentals.
