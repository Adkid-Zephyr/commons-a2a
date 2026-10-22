# Real-source replay and Discord read-only ingestion

## Current scope

The existing Chrome login was used to read the hackathon's `#team-up` channel.
Six visible, relevant team-up messages were saved under ignored
`private-data/discord/`, with a SHA-256 digest and source IDs. Names, handles,
contact details, precise location and identifying achievements were omitted from
the model-facing summaries. Only the relevant self-reported skills and goals
were retained, with attribution as unverified source statements.

The messages are a bounded historical snapshot, not a live subscription or a
complete channel archive. Discord browsing may update the user's local read
position; no posts, reactions, DMs, invites or settings changes were made.

Open http://127.0.0.1:3402/?dataset=discord-replay or use the Test dataset selector.
It has its own SQLite database and event history. The old synthetic demonstration
remains intact. `source_replay` members have `ownerConsent: false` and unknown
current availability. The operator cannot approve on their behalf or create
human handoffs, even if a model returns a proposal. These are test delegates,
not actual authorized representatives of the source authors.

## Organizer cases — pending

The Track 2 brief says The Hack Collective can supply a roughly 450-person Luma
subscriber export and a synthetic member-profile dataset. The hackathon page
links to a public data starter kit, but no member dataset download was found
there. A focused `dataset` search in the event Discord returned no results.
This does not prove it was never shared elsewhere. The actual file/link is still
needed; Discord messages are NOT relabelled as the organizer dataset.

Once provided, normalize only authorized records into the schema in
`lib/replay.mjs`, with `dataset: organizer-replay`, original source digest and
`sourceKind: organizer_synthetic` or `organizer_authorized`. Use anonymous labels,
retain unknowns, and keep the bundle in private-data. Then:

```sh
node scripts/import-replay.mjs private-data/organizer/reviewed-bundle.json
```

The importer refuses to overwrite an existing snapshot. All source replay
datasets disable real-person approvals, including organizer samples.

## Official Discord Bot API

An official Bot API route is ready, but has NOT been tested against Discord
without a supplied bot token. The browser snapshot works independently.

1. Have the event server administrator install your bot. Being a server member
   and having a bot token alone does not grant access to this server.
2. Give it `VIEW_CHANNEL` and `READ_MESSAGE_HISTORY` only in the intended channel.
   Do not give Administrator, Send Messages, Add Reactions or member-management
   permissions. Server/channel overrides must be checked by the administrator.
3. Configure `MESSAGE_CONTENT` in the Developer Portal; some applications require
   Discord approval. Without it, message content can be empty.
4. Put `DISCORD_BOT_TOKEN` and `DISCORD_ALLOWED_CHANNEL_IDS` into ignored
   `.env.local`. Never paste tokens into chat or use a personal user token.
5. Read a single page, at most 30 messages by default:

```sh
node --env-file=.env.local scripts/discord-snapshot.mjs 1562246478049710100
```

Only GET `https://discord.com/api/v10/channels/<allowlisted-id>/messages` exists
in the adapter. Redirects are rejected. 403, 429 and missing message-content
access are explicit failures; no automatic crawl or rate-limit retry loop.
The script saves raw data privately and does NOT automatically transmit it to
the model. Review/redact the snapshot before importing it.

Official references:
- https://docs.discord.com/developers/resources/message#get-channel-messages
- https://docs.discord.com/developers/events/gateway#message-content-intent

## Checks

`npm test` covers import consent semantics, forced unknown availability, disabled
approvals, disjoint dataset state, GET-only allowlisting, ephemeral/bot filtering,
403/429 handling and missing message content using local HTTP stubs.

Explicit real-model source test:

```sh
node scripts/test-source-replay.mjs discord-replay
```

Detailed outputs stay under ignored `private-data/discord-replay/`, never in
public `docs/evidence/`. They must not be presented as real-member consent.
