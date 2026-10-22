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

The visual design (`app/globals.css` theme, `app/layout.tsx` fonts,
`components/commons/navigation.tsx`, `hero.tsx`, `footer.tsx`) is adapted from the
v0 community template "COMPUTE - The Platform to Build & Ship AI Agents" by kerroudj
(https://v0.app/templates/compute-the-platform-to-build-ship-ai-agents-Auw4otwlr20).
Modifications: Commons copy, applied to the existing agent app, live data from
the local API, template sections and claims that do not apply removed. The hero
video and footer banner are still loaded from the template author's Vercel Blob
storage.

No copied Buzz source files are currently included. If source is transplanted
later, preserve upstream notices, pin the commit, and mark modifications here.
