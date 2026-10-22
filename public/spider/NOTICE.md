# Commons Spider: original-layout community adaptation

Upstream: https://github.com/Kirito14IT/prompt-spider-ui
Pinned commit: 4b527ca39e026fb7a2d96a5053a739f0a8cfc670
Copyright (c) 2026 Kirito14IT. MIT license retained in vendor/LICENSE.

Reused upstream source:
- app/spider.js and app/probes.js → vendor/ and reference/: unchanged geometry.
- app/style.css → reference/style.css: unchanged original page/drawer layout.
- app/motion.js and app/reference-track.js → reference/: unchanged geometry helpers.
- app/renderer.js → reference/renderer.js: modified palette, community labels and
  normalized spider animation time; change notice retained at the file top.

community-renderer.js extends the original renderer. It retains the dense editor,
mesh, flying words, cards, stream and four lower panels, while replacing all
reference headers, fixed counts, probability graphs and branch semantics.
community-model.js extracts actual occurrences from supplied text using explicit
name matching, topic vocabulary and need/time patterns. It does not invent
probabilities and does not call a model. The reference module's original count
constants are not used for extraction statistics. Sphere lattice dots are
geometric decoration, not additional people or relationships.

People, signals, keywords and events are extracted mentions, not unique people,
verified claims or confirmed appointments. Each hit points back to its source.
Actual model-call latency and attention counts come from Commons API records.
The screen labels the text animation as a local extraction replay, separately
from live A2A calls. All activity remains in the local sandbox.

The previous alternative is retained at workspace.html, with its original
Commons integration, for member setup, attention cards, approvals and local
human conversations. Only files under public/spider and the dedicated preview
script/tests/docs are owned by this design pass. The other frontend is untouched.

The user explicitly chose this repository as an exception to the earlier 2k-star
preference. It had 55 stars when inspected. No GIF/video reference assets are
bundled; only the MIT code is reused. Keep this notice and vendor/LICENSE with
redistribution.
