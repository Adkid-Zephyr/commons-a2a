# Commons — frozen hackathon submission

**Save your attention. Make meaningful connections.**

- Track: **Track 2 · Know Your Members — Members, intros & speakers**.
- Public repository: https://github.com/Adkid-Zephyr/commons-a2a
- Frozen release tag: `v0.1.0-hackathon-20261022`.
- Project license: **Apache-2.0**; see [LICENSE](../LICENSE).
- Functional source frozen from `52a31f6`; the release adds submission documentation
  and ignores generated packaging/build files. No feature changes in this freeze.

## Official requirements, checked 22 October 2026

Sources: [event and rules](https://gb-community-eng-hackathon-10-2026.teamdeel.workers.dev/hackathon)
and [submission form](https://gb-community-eng-hackathon-10-2026.teamdeel.workers.dev/submit).

The deadline is **21:50 Europe/London, Thursday 22 October 2026**.
The page permits updates until then, with each update replacing the team's entry.
Judges analyze the repository's latest commit, so keep the submitted source frozen.

| Requirement | Prepared status |
| --- | --- |
| Public GitHub repository | Verified public; URL above |
| MIT, Apache-2.0 or AGPL-3.0 LICENSE file | Apache-2.0 exists; package metadata agrees |
| Working demo | Local working app; runtime checks and 34 tests passed |
| Video **under 3 minutes**, accessible by link | Required; final video URL still needs to be supplied |
| Project name | Commons |
| Team name | Optional |
| Contact email | Required; enter privately in official form |
| 1–5 team members | Each needs name, Cursor email, and LinkedIn or X; GitHub/website optional |
| Track | Track 2 · Know Your Members |
| Description | 20–1200 characters; prepared text below is 920 characters |
| Open-source confirmation checkbox | Check after verifying the public repository and license |
| Live demo URL | Optional; leave blank for this local sandbox |

This document is preparation, **not evidence of a submitted entry**. A final
success response from the official form is still required. Do not put localhost
in the public live-demo field. Team emails and private contact data do not belong
in this public repository.

## Copy-ready description

Commons gives community members independent agents that find relevant collaborators and speakers, exchange scoped messages, and bring back a short attention brief. Each agent uses its owner's approved context and makes separate model calls; introductions require both owners' approval before a local human conversation opens. Our working prototype combines an interactive community network and a traceable text-scanning dashboard with real A2A exchanges, evidence references, refusals, clarification and information-only participation. It runs locally with SQLite, includes fictional fixtures and an explicit offline rehearsal mode, and has 34 passing tests. Live Grok calls have been validated; historical Discord replay is isolated, read-only and cannot approve for real members. Built with Next.js, React and React Flow. Apache-2.0, with third-party notices retained. Save your attention. Make meaningful connections.

## Run the frozen release

Requires Node 22.13+; validated with Node 26.7.0. Dependencies are pinned in
`package-lock.json`. Private local data and credentials are deliberately excluded.

```sh
git clone --branch v0.1.0-hackathon-20261022 https://github.com/Adkid-Zephyr/commons-a2a.git
cd commons-a2a
npm ci
npm test
npm run build
npm start
```

- Homepage: http://127.0.0.1:3402/
- Community dashboard: http://127.0.0.1:3402/demo
- Full workflow: http://127.0.0.1:3402/spider/workspace.html

A clean checkout starts with five fictional profiles. To reproduce the expanded
40-person fictional community and its explicitly simulated runs, stop the app,
run `node scripts/prepare-demo-data.mjs --install`, then `npm start`.
See [demo data](DEMO_DATA.md). Historical private Discord replay is not included.

For **no-key reproduction**, open the full workflow, click **Run live demo**,
then **Offline rehearsal · simulated decisions** under Execution. Use the
collaborator scenario. Inspect the exchange, approve from each test owner's
perspective, then open the local conversation. Simulated runs are not live-model
evidence. Run history is preserved; the fresh-demo action avoids contact cooldown
dead ends without resetting existing records.

For **live agents**, copy `.env.example` to `.env.local` and set `MODEL_BASE_URL`,
`MODEL_NAME` and `MODEL_API_KEY` to an authorized Chat Completions-compatible
provider. Restart the app and select real-model execution. Local proxy keys must
only be sent to that proxy. Provider errors stay errors. This release does not
include or require the author's private proxy credentials.

## Record a 2-minute demo

Record the actual application and keep the execution/source labels visible.
Use fictional members for the approval/handoff sequence. A saved successful live
run can be replayed, labelled as a recorded live run; do not pretend it is new.

| Time | Screen | Suggested narration |
| --- | --- | --- |
| 0:00–0:15 | Homepage | “Commons saves your attention and helps you make meaningful connections. We built it for community members looking for collaborators and speakers.” |
| 0:15–0:35 | `/demo`, open source/results drawer | “This view extracts people, needs, topics and events from community context. Every extracted item is traceable to its input. The scan is local rules; the agents run separately.” |
| 0:35–1:10 | Full workflow, successful recorded live collaborator exchange | “Each member has an independent agent and approved context. Their agents check fit and scope in separate model calls. You can inspect the actual exchange, evidence and refusal or clarification.” |
| 1:10–1:40 | For you / approval / local conversation | “The owner gets a short decision. One approval is not enough. Both people must agree before the local human conversation opens.” |
| 1:40–2:00 | Community view, then repository | “Information-only members can just listen. This is an open-source local prototype, with 34 passing tests and setup instructions. Agents move things forward. People make it matter.” |

Upload to YouTube (unlisted accepted), Loom, Vimeo, Google Drive with link access,
Luma or another public video link. Check that a viewer can open it without asking
for permission and that its duration is **less than 180 seconds**.

## Freeze verification and reuse

- `npm test`: **34 passed, 0 failed, 0 skipped**.
- `npm run build`: production compilation and TypeScript checks passed.
- HTTP smoke: `/`, `/demo`, `/spider/workspace.html`, the dashboard JavaScript,
  third-party MIT license and synthetic `/api` returned **200**.
- Synthetic API snapshot did not expose private-note, private-key or API-key fields.
- Targeted secret-pattern scan of tracked text: no matches; no tracked `.env.local`,
  `.data/` or `private-data/`. This is a bounded check, not a claim of a full audit.
- Apache-2.0 in root and package metadata. Bundled Spider MIT license and change
  notices retained; Geist OFL and third-party/brand notices retained. See
  [third-party notices](../THIRD_PARTY_NOTICES.md).
- Existing synthetic live-call evidence is in `docs/evidence/`. No new paid model
  call was needed for the freeze checks.

Production authentication, recurring community monitoring, real-member approval,
external A2A interoperability and cloud deployment remain outside this prototype.
The dashboard's visual text extraction is not an LLM classifier.

The local submission ZIP is created from the frozen Git commit, not the working
directory. It excludes ignored credentials, databases, private replay data,
dependencies, generated build output and untracked screenshots. The accompanying
local manifest records the full commit and ZIP SHA-256.
