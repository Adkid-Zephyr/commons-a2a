# Validation — 2026-10-22

## Final demo readiness update

- Added repeatable synthetic `demo` requests that preserve history and avoid
  contact-cooldown dead ends. Ordinary requests still apply cooldown.
- Added initiating-owner `clarify` requests for incomplete/failed exchanges:
  target the original candidate, preserve history, start fresh approvals,
  at most two linked follow-up generations, blocked for all source replay.
- **25 automated tests passed** and production build passed for this backend batch.
- `scripts/demo-acceptance.mjs` passed with the real Grok route: two independent
  calls, a personal attention decision, one-approval handoff blocked, two local
  fixture approvals creating a human room, then a local test message.
  Evidence: `evidence/demo-acceptance-a75fc9eb-d517-4922-8de3-7a2aae8bf37e.json`.
- Live follow-up acceptance also passed: two real calls produced a new proposal
  for the original candidate, retained the prior failure, and reset both approvals.
  Evidence: `evidence/followup-acceptance-391ac3bb-2af4-402a-8cdc-a3121514078a.json`.
- Demo service was found stopped during inspection and restarted from the built
  production app on loopback port 3402. Final frontend integration remains a
  separate acceptance step owned with the frontend collaborator.

## Attention brief update

- Added a read-only, per-member attention projection without extra model calls:
  decisions, missing information, failures, human handoffs and relevant updates.
- Default live-only selection, bounded pagination, explicit allowed actions,
  source-replay approval suppression and no fabricated time-saved statistics.
- A regression test initially caught a request owner seeing another member's
  digest. Tightened event filtering so only the intended digest recipient sees it.
- 22 automated tests and production build checked for this update.

## Real Discord source update

- Read six relevant visible `#team-up` messages through the existing Chrome
  session. Stored the bounded raw snapshot privately; reviewed and anonymized
  six source profiles plus one recruitment request before model use.
- Separate `discord-replay` SQLite database and UI dataset selector; synthetic
  fixture data/history remains unchanged. No Discord credential was extracted.
- Run `81d22572-e33a-4185-843f-3ca515423c5b`: **passed**, 12 real model calls,
  three four-turn exchanges, all ending `needs_info` because the source recruitment
  message lacks project/role/time details and current owner consent is unknown.
  Zero human handoffs; zero external community writes.
- Raw source, reviewed bundle and detailed model output remain under ignored
  `private-data/` / `.data/`. They are not published as public test fixtures.
- **18 automated tests passed**; production build passed. Added tests for source
  provenance, forced unknown availability, approval blocking, dataset separation,
  Discord GET-only allowlisting, bot/ephemeral filtering, 403/429 and missing content.
- Official Bot API adapter is prepared but NOT live-verified: no Bot token supplied.
- Organizer dataset is NOT acquired: brief offers it on request; no direct member
  dataset link found on the page/data-kit, and Discord `dataset` search found no results.
  This bounded search does not establish absence elsewhere. See SOURCE_REPLAY.md.

## Live-model update

- Connected the existing loopback Quotio proxy, `grok-4.7-build-fast`; requested
  and provider-reported model names matched in recorded successful calls.
- The UI defaults to live mode. All member data remains synthetic; no Discord
  connection or external community action was created.
- Speaker run `bae65a80-85e0-487f-b89e-c58f2a8dd728`: **passed**, 6 independent
  calls across Maya, Leo, Amina and Oscar; 15,648 provider-reported tokens.
  Leo proposed owner review; Amina declined for missing relevant expertise;
  Oscar declined for availability; Jin received an information-only digest.
- First collaborator run `e962859e-1161-4aa9-af4c-3afb1d9d12f2`: **failed** because
  the candidate returned an invalid phase action. Evidence is retained; its
  rejected call usage was not captured by the initial validator, so total usage
  for this failed run is unknown. Nothing was approved or handed off.
- Fixed the model contract by explicitly listing the valid actions for the
  current phase; added failed-response call metadata and a regression test.
- Collaborator rerun `6b4703af-8598-41ca-a417-562659d9ca40`: **passed**, 2 independent
  calls; 5,642 provider-reported tokens. Amina proposed a bounded two-hour React
  accessibility pass, with specific scope limits and owner approval outstanding.
- `scripts/audit-live.mjs` reconstructed the scoped input for all 8 successful
  calls and verified input hashes and agent signatures. See
  `evidence/live-context-audit.json`. This verifies the application's scoped
  request construction, not a provider's internal processing or remote key custody.
- **13 automated tests passed**, including the live adapter against a local HTTP
  stub (separate requests, metadata, HTTP failure, malformed JSON, truncation,
  redirects), cooldown separation, queued-job exclusion and invalid-action logs.
- Production build / TypeScript checks passed after these changes.

Successful run evidence is in `docs/evidence/live-*.json`. None of the live runs
automatically approved an introduction; owner decisions remain pending.

## Passed

- Node 26.7.0; npm installation completed with zero audit findings at install.
- `npm test`: 9 behavior tests passed. Separate contexts and pair history;
  private-note exclusion; information-only handling; decline; double approval;
  outsider rejection; seven-day suppression; idempotent execution and reload;
  model failures; invalid evidence rejection; signature tamper detection;
  onboarding consent; profile-change approval withdrawal.
- `npm run build`: successful production compilation and TypeScript check.
- Local HTTP page returned 200.
- In-app browser: published a synthetic speaker request, saw per-agent
  inquiry/clarification/reply/proposal and refusal records, approved as Maya,
  confirmed no room after one approval, switched to Leo, approved and observed
  the local human room, then sent a local QA message.
- Inspected actual browser rendering of network, inbox and human handoff.
- Final graph layout rebuild passed; screenshot saved at
  `docs/screenshots/a2a-network.png`.

Browser rehearsal used the initial deterministic matching rule. A later
regression tightened primary-topic suitability so Amina declines payment-speaker
requests; automated tests verify this change. Prior local runs remain historical
records and are not silently rewritten.

## Not yet verified / not implemented

- Live LLM workflow validated with synthetic fixtures and anonymized historical
  Discord messages; real members have not authorized representation.
- Organizer member dataset is still missing; Bot API credentials are still missing.
- Member evidence authenticity and real-person willingness.
- Supabase, production authentication, external A2A interoperability,
  recurring scheduling, a month of operation, cloud deployment.
- External writes: none implemented or performed.

All fixture people and evidence claims are synthetic. A sandbox operator can
switch identities; this is not production authorization. Local event signing
does not prove a remote human independently controlled the agent key.
