# Frontend / backend handoff

## Current delivery

The source replay update adds independent databases for `synthetic`,
`discord-replay` and `organizer-replay`. Each retains its own members, requests,
sessions, events and connections. Source cases are local-only; a fresh clone
shows only the synthetic dataset until an authorized replay bundle is imported.

The existing frontend adds only dataset selection, source provenance labels and
disabled source-owner actions. `public/showcase/` is untouched by this update.

## API contract for frontend work

The app runs at `http://127.0.0.1:3402`. All writes to the local API require a
matching Origin header; no external community writes exist.

| Request | Result |
| --- | --- |
| `GET /api?dataset=synthetic` | Original fixture state plus available `datasets` |
| `GET /api?dataset=discord-replay` | Isolated source replay state, if imported |
| `GET /api?dataset=organizer-replay` | Organizer replay, if supplied/imported |
| `GET /api?dataset=<id>&profile=<member-id>` | Operator profile view; never use as public auth |
| `POST /api?dataset=<id>` | Existing action body: `request`, `member`, `approve`, `message` |

New state fields:

- `dataset`: active dataset identifier.
- `datasets`: `{ id, label }[]` for the selector; unavailable source files omitted.
- `sourceInfo`: null for fixtures, otherwise source label, capture time, source
  kind/digest, count, `ownerConsent: false`, and source-derived request templates.
- Source members: `representation: source_replay`, `ownerConsent: false`,
  `availability: unknown`; names are anonymous labels.
- A2A events keep `from`, `to`, `type`, `message`, `reason`, `evidenceIds`, `mode`,
  `model`, `call` (ID, duration, phase, input hash), usage and signature.

Read-only source replay permits local test requests, but rejects `member`,
`approve` and `message`. Do not make UI controls bypass this boundary. A replay
Agent is not an authorized representative of the real source author.

## Running and validation

```sh
npm ci
npm run dev
npm test
npm run build
```

Configure a model locally using `.env.example`. Keys are not shared through Git.
See SOURCE_REPLAY.md for source import and the optional official Discord Bot reader.

Real-model tests consume model usage and are explicit scripts, not part of
`npm test`. The UI's offline rehearsal is labelled; never present it as live AI.

## Sync convention

After a meaningful change and its checks: inspect/fetch, commit, push, report SHA.
If another contributor pushed concurrently, integrate without rewriting their
history; do not force-push. Keep changes to the teammate's frontend focused on
necessary integration and record any API changes here.
