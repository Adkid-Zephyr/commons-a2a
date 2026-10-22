# On-stage demo data — 2026-10-22

## Ready-to-open views

- Expanded synthetic community: http://127.0.0.1:3402/#community
- Anonymized Discord source replay: http://127.0.0.1:3402/?dataset=discord-replay#community
- The separate spider frontend uses the same backend datasets, so refresh its dataset selector to see the expanded members. No spider frontend files were edited by this data expansion.

## Synthetic fixtures

40 fictional profiles in total (original 5 + 35 new). Seven additional topic groups: climate, accessibility, private AI, robotics, education, data tooling and community operations. Profiles cover available builders, unavailable researchers, unknown/novice members and information-only listeners.

14 added rehearsal requests generated 42 sessions and 281 recorded events: 14 awaiting approval, 15 declined, 13 needing information. No new model calls were made. Previous runs and conversations remain; the overall history therefore contains more than these added counts.

Reusable, public fictional assets:

- `public/demo/community-fixtures.json`: all profiles and 14 scenario definitions.
- `public/demo/community-brief.txt`: readable synthetic corpus for extraction demonstrations.
- `public/demo/expansion-report.json`: added counts and provenance.
- `fixtures/expanded-community.mjs`: validated generator inputs.

Regenerate assets: `node scripts/prepare-demo-data.mjs`.
To append missing fictional profiles/runs to a local store, stop port 3402 and run
`node scripts/prepare-demo-data.mjs --install`, then restart the app. The installer
refuses an active server or unfinished requests, backs up existing state, preserves
IDs/history, and skips previously installed scenario keys. It does not change
`lib/seed.mjs` or the original five-person demo behavior.

## Discord source refresh

Read the logged-in event server's `#team-up` channel through Chrome. Captured
26 unique rendered message IDs (duplicate DOM reply excerpts deduplicated), then
reviewed 18 anonymized member profiles. New profiles retain only stated skills
and goals. A participant's later "already on a team" message is retained as a
qualification; historical recruiting is not treated as present availability.
The snapshot does not claim to archive the whole server or follow new messages.

Five source request templates now exist. Five added **rehearsal** runs preserve
the previous live-model source run. The source database has 6 runs, 16 sessions,
92 events and zero human connections at verification. Source-derived records and
agent-generated replies are distinct; historical authors did not write these
agent exchanges and have not authorized these agents to represent them.

Source members keep unknown availability and no owner consent. No approvals,
member edits or human handoffs are enabled. Raw messages, source IDs, normalized
bundle, transformation script, screenshots and source backups remain in ignored
`private-data/` or `.data/`, never the public fictional fixtures.

There was no Bot token configured. This was a browser read-only import, not a
continuous Bot API integration. No posts, DMs, reactions or server settings were
changed. New replay execution made no external model calls.

## Presentation sequence

1. Open Community overview: 40 fictional people and the aggregate recorded network.
2. Click an edge (e.g. the exchange with Theo) to inspect one scenario; Replay
   animates its recorded events and clearly labels rehearsal.
3. Switch to Discord read-only replay. Community overview shows 18 anonymous
   source profiles. Inspect context/evidence and a source request.
4. Show how missing scope or availability remains unknown. Use the synthetic
   dataset, rather than real source identities, for approval/human-handoff demos.

## Checks

33 tests passed, including two new fixture tests. Production build passed.
Browser verification: 40-person overview, edge-to-scenario navigation, 18-person
source view, disabled source-member actions. The API exposes neither private
notes nor signing keys. All prior data was backed up before the append.
