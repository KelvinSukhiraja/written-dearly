# Apple Design MCP — 13 October 2026

Installed at the user's request to support design research for Written Dearly.

- Community implementation: https://github.com/rncrosby/apple-design-mcp (not an Apple-published MCP).
- Version 0.1.0, source commit `906be36adf06e96266afb4c0e019e4cd6d858b07`.
- Local installation: `C:/Users/USER/.codex/tools/apple-design-mcp`.
- Global Codex server name: `apple-design`; enabled, stdio transport.
- Command: `C:/nvm4w/nodejs/node.exe C:/Users/USER/.codex/tools/apple-design-mcp/dist/cli.js mcp`.
- Cache: `C:/Users/USER/.cache/apple-design-mcp`.
- Installed locked dependencies with lifecycle scripts disabled, then compiled with TypeScript. npm reported zero vulnerabilities.

Verification used an actual MCP initialize handshake, tools/list, hig_search and hig_get for all four requested topics. All passed. Reproduce with `node scripts/verify-apple-design-mcp.mjs C:/Users/USER/.codex/tools/apple-design-mcp/dist/cli.js` with network access. Tools: hig_search, hig_get, hig_toc, hig_list. The running chat's tool inventory may need a new session or app restart before these appear directly; configuration and standalone MCP operation are verified.

## Reference for future management-site design work

- [Typography](https://developer.apple.com/design/human-interface-guidelines/typography): legible text, restrained typeface selection, and a clear hierarchy through size and weight.
- [Layout](https://developer.apple.com/design/human-interface-guidelines/layout): prioritize important content, align related elements, group controls, and progressively disclose secondary choices.
- [Navigation and search](https://developer.apple.com/design/human-interface-guidelines/navigation-and-search): guidance for sidebars, tabs, and search fields.
- [Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility): text enlargement, contrast, and information conveyed through more than color or a single sensory channel.

Apply these principles to the couple management website with web-appropriate semantic HTML, responsive CSS, keyboard behavior and WCAG checks. Native Apple point sizes, frameworks and materials are platform-specific; do not copy them mechanically into a website. This integration does not authorize a new visual redesign of the public invitation.

Codex setup reference: https://developers.openai.com/codex/mcp . No application dependencies, saved invitations, or live database settings were changed for this integration.
