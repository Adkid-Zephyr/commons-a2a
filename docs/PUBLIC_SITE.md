# Public judge demo

- Home: https://commons-a2a-london.laufs0310.chatgpt.site
- Spider: https://commons-a2a-london.laufs0310.chatgpt.site/demo/
- Online manual: https://commons-a2a-london.laufs0310.chatgpt.site/guide.html
- Downloadable manual: https://commons-a2a-london.laufs0310.chatgpt.site/guide.md

Published 2026-10-22 through ChatGPT Sites. Access mode is `public`; anonymous
visitors do not need a login, API key or the author's computer. The publication
is separate from the earlier frozen hackathon Git tag.

## Functionality

The existing black community frontend and English-only Spider visualization
are published together. Visitors can inspect 40 fictional profiles and two
frozen live-model runs (eight recorded model calls), extract signals from
sample text, create offline requests, inspect attention outcomes, approve as
both test owners and send browser-local test messages.

The public edition uses the original deterministic rehearsal logic and schema
validation, adapted to the browser. State is kept in `sessionStorage` per tab;
visitors cannot change one another's sessions. A reload retains the current
tab's state. The guide offers Reset my demo. Storage restrictions may limit
persistence. There is no public write API or model endpoint.

No new model calls, paid API access, original Discord messages, source profiles,
private notes or signing keys are included. Recorded outcomes are read-only.
New browser rehearsal events are unsigned; existing recorded model-call
signatures are retained and verified against their original public keys.

## Source and repeatable checks

```sh
npm ci
npm run test:site
npm test
```

`site-source/recordings.json` is a frozen, reviewed export containing only
fictional profiles and historical synthetic-model events. `site-source/` also
contains the browser service, manual and hosting identity. The generator copies
the current frontend and produces `.sites/commons-judges/src/` and `dist/`.
Generated output and the nested Sites source repository stay ignored by the
main repository. The original local API remains loopback-only.

Reuse the existing Site ID; do not create another Site on rebuild:

- Project: `appgprj_6ada75c2348c8191b0b715a906eba2cd`
- Manifest: `.sites/commons-judges/.openai/hosting.json`
- Published version: 1
- Sites source commit: `5fc9b361448f32d007ccbc6559948780bdab2279`
- Deployment: `appgdep_6ada77a5b1bc81918119824621b7671e`

Use the Sites source workflow to push the generated checkout, package the exact
source commit, save a version, then deploy with the existing public audience.
Source credentials must come from the Sites tools and remain in memory/stdin.

## Verification

- 34 existing tests passed.
- Two public-edition tests passed: visitor isolation, blocked model/source
  access, both-owner approval, test-message handoff, English-only Spider and
  absence of a paid model client.
- All eight recorded model-call signatures verified; no private notes or keys
  exported.
- Chrome: guide/reset, collaborator rehearsal, Leo then Amina approval, test
  message, return to Spider and persisted tab state.
- Spider checked at 390 × 844: no horizontal overflow, no Chinese UI text.
- Browser console contained no errors during verification.
- Sites deployment succeeded; the production homepage rendered in Chrome.
