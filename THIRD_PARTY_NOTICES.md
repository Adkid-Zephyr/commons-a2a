# Third-party reuse

Checked 2026-10-22 against the upstream GitHub API.

Pinned reference: Buzz `20ba95ed8906b2b7ae1819bdddadf82c09778097`;
xyflow `8523d8dd9f1551954bc221dccabd6a3119ef9e22`. Installed package versions
are pinned by package-lock.json.

| Upstream | Stars at check | License | Use |
| --- | ---: | --- | --- |
| https://github.com/block/buzz | 36,269 | Apache-2.0 | Architecture reference: separate agent identities, scoped conversations, unified event history and explicit approval steps |
| https://github.com/xyflow/xyflow | 38,751 | MIT | Actual dependency: @xyflow/react for the interactive A2A graph |

Buzz reference files: README.md, crates/buzz-workflow/src/schema.rs,
crates/buzz-core/src/agent_turn_metric.rs. The local workflow uses the same
message / approval separation and preserves unknown token usage as null.
This is an independently implemented domain adaptation, not a bundled Buzz
relay. Rust/Tauri, Nostr transport, code hosting and workspace shell execution
are not copied. Buzz's README marks some workflow approval integration as
in progress; this app implements and tests its own two-owner gate.

React Flow / xyflow copyright belongs to its respective authors. The package's
MIT license is distributed in node_modules/@xyflow/react/LICENSE. Keep it with
redistributed packages. Additional framework dependency notices remain in their
installed packages and lockfile. Star count is a selection filter, not a quality guarantee.

No copied Buzz source files are currently included. If source is transplanted
later, preserve upstream notices, pin the commit, and mark modifications here.

## Visual reference and event partner wordmarks (2026-10-22)

UI reference: https://gb-community-eng-hackathon-10-2026.teamdeel.workers.dev/hackathon#tracks

The partner SVG files in `public/brand/` were retrieved from that site's
`/assets/partners/` directory: `supabase.svg`, `cognee-logotype-white.svg`,
`zero-logo-white.svg`, `notion-logo-white.svg`, and
`cursor-lockup-transparent.svg`. They identify the hackathon's technology
partners, not Commons sponsors or integrations. Brand artwork and trademarks
remain the property of the respective owners; the project's Apache-2.0 license
does not grant trademark rights or relicense these brand assets.

The Commons mark, agent avatar shapes, network SVG and layout implementation
were authored for this project. The reference GIF is studied, not bundled.

## Geist fonts

Geist Sans and Geist Mono font binaries in `public/fonts/` are sourced from the
installed Next.js package (`next/dist/next-devtools/server/font/`). Geist is
provided under the SIL Open Font License 1.1; see `public/fonts/OFL.txt`.
Upstream: https://github.com/vercel/geist-font

## Commons Spider

The bundled Canvas renderer and mechanical spider are adapted from
Kirito14IT/prompt-spider-ui (MIT). See `public/spider/NOTICE.md` and
`public/spider/vendor/LICENSE`. This integration changes colors, branding,
and navigation while retaining the original layout and notices.
