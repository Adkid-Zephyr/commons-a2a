# Commons UI — reference-driven rebuild

## Reference studied

https://gb-community-eng-hackathon-10-2026.teamdeel.workers.dev/hackathon#tracks

Inspected the rendered desktop hero, chat shell, track cards and original Track 2 GIF, plus the publicly served CSS and partner asset URLs. The Track 2 network reference is an animated GIF at `/assets/tracks/know-your-members.gif`, not an embedded video player.

Applied visual details:

- Geist Sans and Geist Mono, locally served; page #0a0a0a, foreground #ededed, cards #141414, chat shell #1c1c1c, translucent white borders.
- Compact sticky event header, centered symbol and hero, neutral white primary pills, restrained orange links, rounded application window, muted navigation and colorful agent marks.
- Dot-grid network with circular person glyphs, thin monochrome connections, corner registration marks and bottom captions.
- Technology partner wordmarks from the reference, explicitly identified as the **hackathon's** partners. No claim that they sponsor Commons or are integrated into its backend.
- Original Commons three-person network mark and original agent avatar artwork. The event's SpaceX identity is not used as Commons' own identity.

## Working functionality

`/` is now the presentation and working application together. `/showcase/index.html` redirects to `/#community`; the old standalone scripted demo is no longer the entry point.

The network uses the selected request's real members, sessions and events. Replay controls reveal recorded events in sequence, animate the corresponding exchange, and allow scrubbing/pause/latest. Replay never calls a model. Labels distinguish recorded live model execution, offline rehearsal, current execution and historical source datasets. No decorative fake members or fabricated live conversations are added.

The same application supports requests, repeatable fixture demos, member profiles/consent/evidence, the attention brief, clarification follow-ups, two-owner approvals and local human conversations. Human conversation lists are filtered to the chosen execution mode. Source replay restrictions are preserved. The existing backend/API were not edited.

## Verification

- TypeScript check and production build passed.
- 25 existing behavior tests passed.
- Browser: recorded replay, network node selection, member listing, request dialog, dataset switching, and attention brief.
- Browser end-to-end: new **rehearsal** speaker demo -> Maya approval -> Leo approval -> local human room -> test message. This uses fictional members and no paid model calls. Existing test records were retained.
- Source replay: editing and real-owner actions remain disabled.
- Responsive visual review at 390 px through an iframe viewport, including the network; mobile node labels enlarged after review.
- Browser console error list was empty during verification.

## Source files

- `app/page.tsx`: existing endpoint integration and main UI.
- `app/globals.css`: reference-aligned tokens, layout, animation and responsive styles.
- `app/ui/network.tsx`: event-driven SVG visualization.
- `app/ui/brand.tsx`: Commons mark, agent identities and person glyph.
- `app/ui/partners.tsx`: event technology partner attribution.
- `public/brand/`: original partner SVGs, attribution below.
- `public/fonts/`: Geist fonts and SIL Open Font License.

The service remains loopback-only. This UI work does not establish a Discord app or publish the operator sandbox to the internet.

## Final frontend integration (2026-10-22)

The current Grok Bot reference-based black community homepage stays at `/`.
`See agents in action` and the header's `Spider demo` link open `/demo` on
the same server. This preserves the original spider canvas, dense mesh, four
classification lanes and controls; its palette, brand and buttons now follow
the homepage. No frontend-branch video landing page was imported.

The demo's `A2A 工作台` links return to the existing community application,
carrying dataset, operator, selected request and execution mode. Attention
items open the attention tab. Both pages use the unchanged same-origin API.
Opening or replaying the demo does not initiate model calls. The source replay
restrictions and separate local-extraction/model-execution labels remain.

Canonical entry: http://127.0.0.1:3402/demo . The optional 3403 preview launcher
redirects its dashboard entry to this URL. `/spider/index.html` and
`/spider/dashboard.html` remain compatible aliases.

Integration checks: 34 tests passed; production build passed. Chrome verified
home → demo → community context links, replay seeking and the controls drawer,
with no console errors. The 390 × 844 demo viewport was visually checked.
Screenshots: `docs/screenshots/combined-home.png` and
`docs/screenshots/combined-spider.png` (synthetic data only).
