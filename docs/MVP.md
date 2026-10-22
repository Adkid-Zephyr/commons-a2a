# Commons — Track 2 MVP

Every member has a separate agent. Agents discover relevant members, exchange
bounded messages, request owner approval and hand off to humans.

## Track 2 acceptance

- Opt-in member profile: goals, skills, availability, public evidence, consent.
- Weekly introductions: explain why, exclude recent proposals, log no-match.
- Speaker shortlist: a real topic, evidence per person, distinguish member-provided
  evidence from independently verified evidence and owner-confirmed availability.
- End-to-end introduction with double approval; refusals and failures visible.
- Thread revival is an additional suggested workflow, not in tonight's core.
- Repeated manual runs exercise weekly selection; a month of operation is not yet tested.

## Independent agents

Separate member IDs, public profiles, private owner notes, scoped pair threads,
separate model calls and separate event-signing keys. A receiving agent sees only
its own context, the request and the pair's messages. This is a local A2A protocol,
not a claim of external A2A standard or Nostr interoperability.

## Isolation

Local single-operator sandbox, bound to loopback. Member switcher is an operator
test fixture, not production authentication. No Discord write capability exists.
Raw private notes are not sent to models: only the approved disclosure packet is.
All built-in profiles and evidence are fictional fixtures. Organizer data is not
yet supplied. Imported data stays in ignored local storage; only use authorized,
redacted data. Do not publish this sandbox with real data.

## Verification boundaries

Offline rehearsal is clearly labelled and uses deterministic agents for workflow
testing. Real mode is the UI default, uses the configured local Quotio/Grok route,
and uses one call per
agent turn. Provider errors remain errors; there is no silent simulated fallback.
Real Discord, organizer data, real-person consent, sustained operation and cloud
deployment remain separate acceptance items.
