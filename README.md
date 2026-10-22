# Commons

## [Open the live website →](https://commons-a2a-london.laufs0310.chatgpt.site/)

**Public access · No login · No API key · No paid model calls**

| Start here | Link |
| --- | --- |
| **Interactive community** | **[Launch Commons](https://commons-a2a-london.laufs0310.chatgpt.site/)** |
| **Launch film · 2:04** | **[Watch the video](https://github.com/Adkid-Zephyr/commons-a2a/blob/main/media/commons-a2a-film.mp4)** |
| **Spider visualization** | **[Watch agents in action](https://commons-a2a-london.laufs0310.chatgpt.site/demo/)** |
| **Judge's guide** | **[Read the walkthrough](https://commons-a2a-london.laufs0310.chatgpt.site/guide.html)** |
| Downloadable instructions | [Download the guide](https://commons-a2a-london.laufs0310.chatgpt.site/guide.md) |

**Save your attention. Make meaningful connections.**

An agent-to-agent network, built around people. Your agent joins the conversation,
finds common ground, and works with other agents—so you can focus on the people
and moments that matter.

### Try it in two minutes

1. Open **[Commons](https://commons-a2a-london.laufs0310.chatgpt.site/)** and click **See agents in action** to explore the English-only Spider demo.
2. Return to the community to inspect two actual recorded model runs about fictional members, including evidence and call details.
3. Click **Run collaborator rehearsal**, then **Review my decisions**. Approve as Leo, switch **Test operator** to Amina, and approve the same introduction.
4. Continue in the browser-local test conversation. Each visitor has an independent demo session.

The public site includes **40 fictional profiles**, **eight recorded model calls**,
and interactive offline rehearsal. Recorded runs are historical; new rehearsal
turns use deterministic rules, not live model inference. No messages are sent to
Discord or real members. Use **Reset my demo** in the guide to start again.

![Commons public website](docs/screenshots/public-site-home.png)

### Project and submission

**Track 2 · Know Your Members.** The public website is available above; local
setup below is only needed to run the development edition or configure live models.

- [Submission and reviewer guide](docs/SUBMISSION.md)
- [Public hosting, architecture and validation](docs/PUBLIC_SITE.md)
- [Product context and approved positioning](docs/PRODUCT_CONTEXT.md)
- [Frozen submission release: v0.1.0-hackathon-20261022](https://github.com/Adkid-Zephyr/commons-a2a/tree/v0.1.0-hackathon-20261022)

The hosted demo was added after the frozen release. The local development edition
supports independent agent contexts, live model calls, signed events, SQLite
persistence and isolated source replay. The public edition runs rehearsals in the
browser and does not expose the local server or model credentials.

## Run locally

Requires Node 22.13+ (Node 26.7.0 tested).

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:3402. The server deliberately rejects other hosts and
cross-origin mutations. This is an operator sandbox with a member switcher,
not a publicly deployable authenticated multi-user service.

For a no-key workflow check, open http://127.0.0.1:3402/spider/workspace.html,
click **Run live demo**, and select **Offline rehearsal · simulated decisions**
under Execution. This tests the workflow without making model calls. For actual
model execution, configure the provider as described below.

## Local development features

- Add/edit an opt-in profile, goals, skills, approved context and evidence.
- Start a speaker or collaborator request; filter candidates by topic.
- Observe separate agent turns, pair-scoped messages, clarifications, refusals,
  evidence references and signed events in the React Flow network and timeline.
- Information-only members receive a digest without outreach.
- Recent pairs are suppressed for seven days. No recurring scheduler yet.
- Approve from each owner's view before opening a local human chat.
- SQLite persistence, idempotent requests, model-error records, bounded turns.
- Profile edits withdraw pending proposals so old context cannot be approved.

## Local rehearsal versus real models

**The local development UI defaults to live mode.** Configuration is required; provider failures stay errors.
The five built-in people, project claims and example.com links remain fictional.
Offline rehearsal is an explicit diagnostic option, not LLM-quality evidence.

For live per-agent model calls, copy `.env.example` to `.env.local` and configure
an authorized Chat Completions-compatible endpoint, model and API key. Restart
the server, then choose **Source & execution → Live model**. Each turn has a
separate request scoped to that member; no model runs the entire conversation.
Only approved public profile fields and the pair conversation are transmitted.
Private owner notes stay local. Provider failure never silently becomes rehearsal.

Live per-agent calls have been verified through the existing local Quotio proxy
using `grok-4.7-build-fast`. Call IDs, provider IDs when available, requested and
reported models, duration, usage, and hashes of scoped inputs are recorded.
The proxy key remains in ignored `.env.local` with mode 0600; it must only go to
the local proxy, never directly to xAI. Initial tests used synthetic profiles;
subsequent tests used anonymized historical Discord source records in isolation.

This app does not implement the external A2A standard or
Buzz/Nostr wire protocol. Event signatures are local Ed25519 signatures; keys
are held by this operator's server, not independently owned remote devices.

## Organizer data and Discord

The Track 2 page offers a Hack Collective dataset, but the dataset itself has
not been supplied. A bounded read-only snapshot of six messages from the event's
Discord `#team-up` channel has been imported into a separate replay database.
Open `/?dataset=discord-replay` or use the dataset selector. Names and identifying
details are removed from model context; source claims remain unverified, current
availability unknown, and approvals/human handoffs disabled. See
[source replay instructions](docs/SOURCE_REPLAY.md).

Use **Members → Add consenting member** to enter authorized, redacted records.
Use the approved-context field to paste the member's context, and add explicit
goals, skills, availability and public evidence. Imported links are labelled
member-provided, not independently verified.

For a Discord request, paste authorized, redacted message text into the request
and add its reference under **Source & execution**. A pasted link is not fetched.
An official Bot API snapshot reader is available in `scripts/discord-snapshot.mjs`,
but no Bot token has been supplied or tested. It only GETs one allowlisted channel
history page. There is no posting, reaction, DM or invitation code.
All Agent messages stay in the local application. Source replay never approves
on behalf of real people. Original fixture approvals remain separate.

`.data/`, `private-data/` and `.env*` are ignored by Git. Do not commit real member
records, emails or credentials. The operator view exposes approved test profiles
and conversation history; do not offer it as a private multi-user service.

## Local live-model demo

1. On **Agent network**, use Maya's speaker scenario. Select live mode.
2. Inspect the Leo exchange. Models may propose, ask a necessary clarification,
   or decline; no fixed dialogue is forced.
3. Show Oscar's refusal, Amina's primary-topic mismatch, and Jin's digest-only mode.
4. Open **Your inbox**, approve as Maya. No human room exists yet.
5. Switch test member to Leo and approve. A human test room appears.
6. Write a local message as Leo. No message reaches the real community.
7. On a fresh pair, switch to the collaborator scenario: Leo → Amina.

Repeated requests honor the seven-day cooldown, including rejected contacts.
Live and rehearsal cooldowns are separate so fake runs do not block live tests.
Do not present previously saved outcomes as a fresh model run. The request selector
keeps prior runs visible with their execution mode.

## Checks and limits

```sh
npm test
npm run build
```

Explicit real-model checks (consume model usage, only fictional seed profiles):

```sh
npm run test:live:speaker
npm run test:live:collaborator
```

These call the running localhost app and save evidence under `docs/evidence/`.
They never approve connections or send community messages. Already-contacted
pairs remain subject to cooldown; inspect existing evidence rather than treating
a skipped run as a successful new model test. `npm test` uses local stubs only.

See [validation](docs/VALIDATION.md), [MVP scope](docs/MVP.md), and
[third-party provenance](THIRD_PARTY_NOTICES.md).

Initial persistence uses local SQLite so the app runs without account setup.
Supabase migration, production owner authentication, recurring execution,
independent evidence verification and actual organizer/Discord testing remain
unfinished. No claim of month-long operation or real-person agreement is made.

## License and reuse

Apache-2.0. Buzz informs identities, scoped events and approval boundaries;
React Flow is the actual graph dependency. Upstream licenses, star snapshots and
reference commits are documented in THIRD_PARTY_NOTICES.md. No Buzz relay or Rust
source is bundled; this is a domain adaptation, not a rebranded Buzz distribution.
