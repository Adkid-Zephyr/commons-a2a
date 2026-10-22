# Tonight's demo: show the work, then give attention back

## The moment to aim for

An agent finds another person, checks whether the request fits that person's
goals, and negotiates a small concrete contribution. The owner receives one
decision with evidence and scope. The screen then becomes a conversation between
people. This is the payoff of **Save your attention. Make meaningful connections.**

## Three useful visual beats for firdavz

1. **Different goals, different outcomes.** A speaker request reaches several
   agents: one offers a fit, one declines because expertise differs, another
   declines because of availability, and an information-only member is not
   disturbed. Render actual backend outcomes, including no-match and failure.
2. **The room does the coordination.** Show the active sender/receiver and actual
   messages; expand the evidence or action basis on demand. Move to the attention
   card once the exchange finishes. Do not ask the user to read the entire trace.
3. **People make it matter.** One test owner approves: still waiting. The second
   approves: open the local human conversation with the agreed scope attached.

The visually satisfying transition is “many coordination steps → one worthwhile
decision”, not an invented minutes-saved number. Keep real call counts, modes
and provenance visible. All synthetic fixtures remain labelled.

## Recommended 90-second narrative

| Time | Show | Say |
| --- | --- | --- |
| 0–10s | Member goal and two-hour availability | I want a collaborator, without reading every message. |
| 10–40s | Run collaborator demo; actual independent agent turns | My agent checks fit and scope with theirs. |
| 40–55s | A specific proposal and evidence | This is the work we could do together, and why it fits. |
| 55–75s | Both test approvals, local human chat | I decide whether the connection is worth my time. |
| 75–90s | Briefly show speaker outcomes / information-only member | The same network serves different goals without automating everyone’s social life. |

Provider latency is variable. If showing a saved run, label it as a recorded
live run rather than pretending generation is occurring now. Source replay is
an optional evidence segment: it correctly identifies missing details and cannot
stand in for real members' approval.

## Backend readiness and remaining work

Implemented: independent live turns, bounded A2A, evidence references, attention
brief, double-approval handoff, repeatable fixture demos and owner clarification
for incomplete exchanges. Tests cover refusal, isolation, idempotency and source
approval restrictions. See VALIDATION.md for actual check results.

Remaining to assemble the final presentation:

- Frontend must connect its polished views to the live events/attention API,
  including the new demo CTA and optional clarification form. Backend endpoints
  alone do not establish that the teammate's frontend is integrated.
- Rehearse the final frontend build once end-to-end and record real footage.
- Produce the video after the interface is stable; it is not generated yet.

Outside tonight's acceptance: production authentication, always-on community
monitoring, multi-platform outreach, actual member-approved source agents,
organizer data that has not been supplied, and long-term effectiveness claims.

## Local run

```sh
npm ci
npm run build
npm run start
```

Open http://127.0.0.1:3402. Model credentials stay in local .env.local.
For backend acceptance with actual model calls and simulated fixture approvals:

```sh
node scripts/demo-acceptance.mjs
```

This script only uses the synthetic fixture dataset. It consumes model usage,
preserves run history and performs no external community action. Use the normal
frontend controls for presentation; CLI output is only verification evidence.
