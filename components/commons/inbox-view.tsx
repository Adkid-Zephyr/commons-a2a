"use client";

import { statusLabel, tagClass, type CommonsApp } from "./use-commons-app";

export function InboxView({ app }: { app: CommonsApp }) {
  const { ownerPending, owner, requests, sessions, connections, member, busy, decide, inspect, chat, setChat, sendMessage } = app;
  const rooms = connections.filter((c) => c.members.includes(owner));

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <section>
        <h3 className="mb-6 flex items-center gap-3 font-display text-3xl lg:text-4xl">
          Needs your decision <span className="chip">{ownerPending.length}</span>
        </h3>
        {!ownerPending.length && (
          <div className="panel">
            <p className="mb-2 font-display text-2xl">You’re caught up.</p>
            <p className="text-muted-foreground">Agents will bring relevant proposals here. Switch test member to review the other side.</p>
          </div>
        )}
        <div className="flex flex-col gap-4">
          {ownerPending.map((s) => {
            const otherId = s.ownerId === owner ? s.candidateId : s.ownerId;
            return (
              <article className="panel" key={s.id}>
                <span className="eyebrow">{requests.find((r) => r.id === s.requestId)?.kind} · owner approval</span>
                <h4 className="mt-3 mb-3 font-display text-3xl">Connect with {member(otherId)?.name}</h4>
                <p className="leading-relaxed text-muted-foreground">{s.summary}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {[s.ownerId, s.candidateId].map((id: string) => (
                    <span key={id} className="chip">
                      {member(id)?.name}: {s.approvals[id]}
                    </span>
                  ))}
                </div>
                {s.evidenceIds.map((id: string) => {
                  const ev = member(s.candidateId)?.evidence.find((e: any) => e.id === id);
                  return (
                    ev && (
                      <div className="mt-4" key={id}>
                        <a className="underline-offset-4 hover:underline" href={ev.url} target="_blank" rel="noreferrer">
                          {ev.title} ↗
                        </a>
                        <small className="block text-xs text-muted-foreground">{ev.kind === "synthetic" ? "Synthetic evidence" : "Member-provided evidence; verification pending"}</small>
                      </div>
                    )
                  );
                })}
                <div className="mt-6 flex flex-wrap gap-3">
                  <button className="btn btn-primary" disabled={busy} onClick={() => decide(s.id, "approved")}>
                    Approve introduction
                  </button>
                  <button className="btn" disabled={busy} onClick={() => decide(s.id, "declined")}>
                    Decline
                  </button>
                  <button className="btn" onClick={() => inspect(s)}>
                    Inspect exchange
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        <h3 className="mt-14 mb-6 font-display text-3xl">Outcomes &amp; shortlist</h3>
        <div className="flex flex-col gap-3">
          {sessions
            .filter((s) => [s.ownerId, s.candidateId].includes(owner))
            .map((s) => (
              <div className="panel !p-5" key={s.id}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <b className="font-medium">
                    {member(s.ownerId)?.name} ↔ {member(s.candidateId)?.name}
                  </b>
                  <span className={tagClass(s.status)}>{statusLabel(s.status)}</span>
                </div>
                <p className="mt-2 leading-relaxed text-muted-foreground">{s.error || s.summary}</p>
                <small className="mt-2 block font-mono text-[11px] text-muted-foreground">
                  {s.evidenceIds.length} evidence item(s) · {s.turns} agent turns · {requests.find((r) => r.id === s.requestId)?.mode}
                </small>
              </div>
            ))}
        </div>
      </section>

      <section>
        <h3 className="mb-6 font-display text-3xl lg:text-4xl">People, from here on</h3>
        {!rooms.length && (
          <div className="panel">
            <p className="mb-2 font-display text-2xl">Both people get a say.</p>
            <p className="text-muted-foreground">A private test conversation opens after both owners approve. No Discord message is sent.</p>
          </div>
        )}
        <div className="flex flex-col gap-4">
          {rooms.map((c) => (
            <div className="panel" key={c.id}>
              <span className="eyebrow">Human conversation · local test</span>
              <h4 className="mt-3 mb-3 font-display text-3xl">{c.members.map((id: string) => member(id)?.name).join(" & ")}</h4>
              <p className="leading-relaxed text-muted-foreground">{c.summary}</p>
              <div className="mt-4 flex flex-col divide-y divide-foreground/10">
                {c.messages.map((m: any) => (
                  <div className="py-3" key={m.id}>
                    <b className="text-sm font-medium">{member(m.ownerId)?.name}</b>
                    <p className="text-muted-foreground">{m.message}</p>
                  </div>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage(c.id);
                }}
              >
                <label className="field">
                  Your message
                  <textarea className="input resize-y" required value={chat} onChange={(e) => setChat(e.target.value)} placeholder="Pick up the conversation yourself…" />
                </label>
                <button className="btn btn-primary mt-4" disabled={busy}>
                  Send in test room
                </button>
              </form>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
