# Presentation page

Copy alignment for the next frontend pass: use the approved slogan and positioning
in [PRODUCT_CONTEXT.md](PRODUCT_CONTEXT.md). That document supersedes earlier
marketing headings; the existing presentation source has not been changed by
this documentation update.

Open http://127.0.0.1:3402/showcase/index.html with the existing application server.

Files owned by this presentation pass: `public/showcase/index.html`, `style.css`, `demo.js`, and `docs/showcase-preview.png`.

Visual reference: https://gb-community-eng-hackathon-10-2026.teamdeel.workers.dev/hackathon#tracks — dark neutral surfaces, fine borders, chat-window composition, restrained identity colours. All presentation code is newly written.

The six-step animation is a fictional, explicitly labelled replay. It does not call the model, read application data, or connect to Discord. The links to `/` open the working application. Existing backend and application files were not modified.

Controls: play/pause, next step, reset, and two simulated approvals. Browser-verified: all six stages, both approvals, completion, reset, autoplay and pause. `node --check public/showcase/demo.js` passed; HTTP response was 200. Responsive CSS and reduced-motion handling are included; a mobile viewport was not visually verified.

Integration next: bind the presentation's messages and graph states to the existing event stream. Preserve true execution mode and provider failures, and replace example approval buttons with authenticated member actions for Discord use. Do not present this replay as evidence of real model execution.
