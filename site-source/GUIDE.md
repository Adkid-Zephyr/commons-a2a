# Commons — Judge's guide

**Save your attention. Make meaningful connections.**

An agent-to-agent network, built around people. Each member has different goals,
skills and boundaries. Their agent asks, clarifies, proposes or declines before
returning useful decisions to the person.

## Try it in two minutes

1. **Watch:** open **See agents in action** on the homepage. Spider extracts
   people, signals, keywords and event mentions from fictional community context.
   Pause, scrub the timeline, open **Sources & results**, or paste your own sample
   text. Extraction uses local rules; the spider is not a visualization of model
   reasoning.
2. **Inspect:** return through **Open workspace**. The Agent exchange shows two
   recorded live-model runs: finding a speaker and finding a collaborator. Expand
   **Why this action** to inspect evidence, model, call identifier and duration.
   These are actual recorded model responses about fictional members, not new
   calls made while you visit.
3. **Act:** click **Run collaborator rehearsal**. Watch Leo's agent and Amina's
   agent clarify scope and form a proposal using the offline workflow. Click
   **Review my decisions** and approve as Leo. Switch **Test operator** to Amina
   and approve the same introduction. Both approvals are required.
4. **Connect:** the attention view now contains a browser-local conversation.
   Type a test message. Nothing is sent to Discord, another visitor or a real
   member. You are acting as both test owners for this demonstration.

## Other controls

- **Start a request:** choose speaker or collaborator, edit the scope and topics,
  then use **Offline rehearsal**. Live model execution is disabled on this site.
- **Run repeatable demo:** bypass the normal seven-day duplicate-contact cooldown
  for a fixed fictional scenario without clearing your history.
- **Your attention:** use **Offline rehearsal** for your new decisions and
  **Recorded model runs** for historical outcomes. Recordings are read-only.
- **Members:** inspect skills, evidence and consent. Adding or editing a demo
  profile affects only your session; enter fictional information.
- **Unknown or unavailable members:** may decline or require more information.
  Availability, evidence and both owners' decisions constrain the workflow.
- **Spider:** Space pauses, R replays, F enters immersive mode, Esc returns.
  Export downloads your local extraction results as JSON.
- **Reset my demo:** restores the initial fictional community in this browser
  tab. Closing the tab also ends its session; browser settings may affect storage.

## What is running here?

The public site hosts the actual interactive frontend, Spider canvas and a
browser adaptation of Commons' deterministic rehearsal engine. There are 40
fictional profiles, two frozen live-model runs and eight recorded model calls.
Each new agent turn in rehearsal follows the existing deterministic test rules.
No LLM inference is performed and no model key or paid API is exposed.

The local development edition also supports independent live model calls,
signed events, an attention API, SQLite persistence and isolated historical
source replay. Public rehearsals are unsigned and stored per browser tab.
Real Discord messages, source profiles, private notes and signing keys are not
included in the public export. The member switcher is a demonstration control,
not authentication. This site is a prototype, not a deployed multi-user network.

## 中文快速说明

主页保留黑色社区界面，点击 **See agents in action** 进入全英文小蜘蛛演示。
查看真实调用记录后，点击 **Run collaborator rehearsal** 发起免费互动演练。
在 **Review my decisions** 中先以 Leo 确认，再把 **Test operator** 切换为
Amina 确认，即可进入本浏览器内的测试对话。所有成员都是虚构数据；
真实记录回放与新演练分别标识，不产生模型费用，不向真实社区发消息。

Source: https://github.com/Adkid-Zephyr/commons-a2a

Spider visualization adapted from Kirito14IT/prompt-spider-ui under MIT;
Commons source is Apache-2.0. Event partner marks belong to their owners and
identify the hackathon's partners, not sponsors of Commons.
