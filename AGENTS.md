<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## User-approved production workflow

Established 18 September 2026 for Written Dearly. The browser wireframe review is a reference checkpoint, not a mandatory gate for future work. Continue production implementation incrementally while preserving existing work and the approved party/member model:

1. Document requirements and behavior in Notion and the project design notes.
2. Create responsive browser-based wireframes (or Figma when available) with important loading, empty, error and success states. Figma is optional and must not block progress. Keep review prototypes isolated from production application code and use fictional data.
3. Implement in small production slices, preserving real loading, empty, error and success states.
4. Verify each slice and checkpoint before moving to the next one.

The user has authorized continuing website production without an approval gate for every future wireframe. Material changes to the approved party/member data model, live Supabase schema, security model or external delivery infrastructure still require a checkpoint before dependent work. Routine technical decisions remain autonomous. Preserve prior designs and unrelated code.

Read `docs/design-review-01.md`, `docs/figma-state.json`, and `docs/second-brain.md` for current scope and progress. Live database changes still require separate approval.
