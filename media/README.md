# Commons film

A 2:04 launch film for Commons: the problem, the Spider read, independent agents,
the recorded A2A exchange, the attention brief, double approval and the human handoff.

| File | What it is |
| --- | --- |
| `commons-a2a-film.mp4` | 1920×1080, 60 fps, AAC stereo. Under the 3-minute video limit. |
| `commons-a2a-film.html` | The same film as one self-contained page. Open it in Chrome or Edge and press **Play** with sound on. |

Player keys: Space play/pause · ←/→ seek 5 s · F fullscreen · C Chinese subtitles · R restart.

## How it was made

Every frame is drawn on a single canvas and every sound is synthesized with Web Audio
(120 BPM, A minor). No video model and no stock footage. The MP4 was rendered frame by
frame from the HTML page with headless Chrome, with the soundtrack rendered through an
`OfflineAudioContext`, then muxed with ffmpeg.

## Where the content comes from

- Agent messages, timestamps, call IDs, durations and token counts (6 calls, 15,648 tokens,
  16 signed events): `docs/evidence/live-speaker-bae65a80-….json`.
- Leo → Amina clarification and proposal: `docs/evidence/followup-acceptance-391ac3bb-….json`.
- Spider lane totals (47 messages → 232 mentions): the dashboard's recorded replay.
- 40 members, 7 topic groups, 14 scenarios, 281 recorded events: [demo data](../docs/DEMO_DATA.md).

All members are fictional fixtures. The chat lines in the opening and Spider scenes and
the two messages in the human room are illustrative, and the film labels them that way.
