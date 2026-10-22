"use client";

import { useMemo } from "react";
import { ReactFlow, Background, Controls, MarkerType, Position } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ArrowUpRight } from "lucide-react";
import { colors, statusLabel, tagClass, type CommonsApp } from "./use-commons-app";

function availabilityLabel(m: any) {
  if (m.participation === "information_only") return "Listening only";
  if (m.availability === "unavailable") return "Unavailable";
  if (m.availability === "unknown") return "Availability unknown";
  return "Open to requests";
}

export function NetworkView({ app }: { app: CommonsApp }) {
  const { members, selected, setSelected, requestSessions, setSessionId, request, activeEvent, member } = app;

  const nodes = useMemo(
    () =>
      members.map((m, i) => ({
        id: m.id,
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        position: i === 0 ? { x: 15, y: 165 } : { x: 315, y: (i - 1) * 120 },
        data: {
          label: (
            <div className="p-3 text-left">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium text-black" style={{ background: colors[i % colors.length] }}>
                  {m.name.slice(0, 1)}
                </span>
                <span className="min-w-0">
                  <strong className="block text-sm font-medium text-foreground">{m.name}&apos;s agent</strong>
                  <small className="block truncate text-[11px] text-muted-foreground">{m.role}</small>
                </span>
              </div>
              <div className="mt-2.5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: m.participation === "information_only" ? "#777" : colors[i % colors.length] }} />
                {availabilityLabel(m)}
              </div>
            </div>
          ),
        },
        style: { border: selected === m.id ? "1px solid #eca8d6" : "1px solid rgba(255,255,255,0.12)", borderRadius: 4, padding: 0, width: 230, background: "oklch(0.09 0.008 260)", color: "inherit", boxShadow: "none" },
        selected: selected === m.id,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [app.data?.members, selected]
  );
  const edges = requestSessions.map((s) => ({
    id: s.id,
    source: s.ownerId,
    target: s.candidateId,
    animated: s.status === "running",
    label: statusLabel(s.status),
    markerEnd: { type: MarkerType.ArrowClosed, color: s.status === "declined" ? "#555" : "#eca8d6" },
    style: { stroke: s.status === "declined" ? "#555" : "#eca8d6", strokeWidth: 1.5 },
    labelStyle: { fontSize: 10, fill: "#9a9a92" },
    labelBgStyle: { fill: "oklch(0.06 0.008 260)" },
    labelBgPadding: [5, 3] as [number, number],
  }));

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-12">
        {/* A2A graph */}
        <section className="panel flex flex-col !p-0 lg:col-span-8">
          <div className="flex items-start justify-between gap-4 p-6 lg:p-8 pb-0 lg:pb-0">
            <div>
              <span className="eyebrow">A2A observatory</span>
              <h3 className="mt-3 font-display text-3xl lg:text-4xl">Behind every connection</h3>
            </div>
            <span className="chip shrink-0">{members.length} independent agents</span>
          </div>
          <div className="h-[420px] lg:h-[460px]">
            <ReactFlow
              colorMode="dark"
              style={{ background: "transparent" }}
              nodes={nodes}
              edges={edges}
              fitView
              nodesDraggable={false}
              nodesConnectable={false}
              onNodeClick={(_, n) => setSelected(n.id)}
              onEdgeClick={(_, e) => setSessionId(e.id)}
              minZoom={0.4}
              maxZoom={1.3}
            >
              <Background color="rgba(255,255,255,0.08)" gap={22} size={1} />
              <Controls showInteractive={false} />
            </ReactFlow>
          </div>
          <div className="flex flex-wrap items-center gap-3 border-t border-foreground/10 px-6 py-4 font-mono text-xs text-muted-foreground lg:px-8">
            <span className={`h-2 w-2 rounded-full ${request?.status === "running" ? "animate-pulse bg-accent-pink" : "bg-foreground/30"}`} />
            {request?.status === "running" ? `${member(activeEvent?.from)?.name ?? "Agent"} is working…` : request ? `Request ${statusLabel(request.status)}` : "Publish a request to see agents connect."}
            <span className="ml-auto">Click a member or connection to inspect</span>
          </div>
        </section>

        <RequestPanel app={app} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        <Timeline app={app} />
        <Inspector app={app} />
      </div>
    </>
  );
}

function RequestPanel({ app }: { app: CommonsApp }) {
  const { kind, chooseScenario, synthetic, title, setTitle, details, setDetails, topics, setTopics, source, setSource, mode, setMode, data, busy, running, submitRequest, member, owner } = app;
  return (
    <section className="panel lg:col-span-4">
      <span className="eyebrow">Start with a real need</span>
      <h3 className="mt-3 mb-6 font-display text-3xl lg:text-4xl">What are you looking for?</h3>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitRequest();
        }}
      >
        <div className="grid grid-cols-2 border border-foreground/15">
          {[
            ["speaker", "A speaker"],
            ["collaborator", "A collaborator"],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              disabled={!synthetic}
              onClick={() => chooseScenario(id)}
              className={`py-2.5 text-sm transition-colors disabled:opacity-40 ${kind === id ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="field">
          Your request
          <input className="input" required minLength={4} maxLength={160} value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label className="field">
          Scope &amp; time
          <textarea className="input resize-y" required minLength={10} maxLength={3000} value={details} onChange={(e) => setDetails(e.target.value)} rows={3} />
        </label>
        <label className="field">
          Topics
          <input className="input" value={topics} onChange={(e) => setTopics(e.target.value)} />
        </label>
        <details className="mt-5">
          <summary>Source &amp; execution</summary>
          <label className="field">
            Authorized source link (optional)
            <input className="input" type="url" placeholder="https://discord.com/channels/…" value={source} onChange={(e) => setSource(e.target.value)} />
          </label>
          <p className="mt-2 text-xs text-muted-foreground">Paste only authorized, redacted request text. Links are references, not automatically fetched.</p>
          <label className="field">
            Execution
            <select className="input" value={mode} onChange={(e) => setMode(e.target.value)}>
              <option value="rehearsal">Offline rehearsal · simulated decisions</option>
              <option value="live" disabled={!data.configured}>
                Live model {data.configured ? "· configured" : "· not configured"}
              </option>
            </select>
          </label>
        </details>
        <button className="btn btn-primary mt-6 w-full h-12" disabled={busy || running} type="submit">
          {running ? "Agents are coordinating…" : "Let my agent explore"} <ArrowUpRight className="h-4 w-4" />
        </button>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          {synthetic ? "On behalf of" : "Replaying source record for"} {member(owner)?.name}. At most 3 new candidates; repeat contacts suppressed for 7 days.
        </p>
      </form>
    </section>
  );
}

function Timeline({ app }: { app: CommonsApp }) {
  const { request, liveCalls, requests, setRequestId, sessionId, setSessionId, requestSessions, events, member } = app;
  return (
    <section className="panel lg:col-span-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="eyebrow">The conversation, not a script</span>
          <h3 className="mt-3 font-display text-3xl lg:text-4xl">Agent exchange</h3>
          {request && (
            <p className="mt-2 font-mono text-[11px] text-muted-foreground">
              <span className={request.mode === "live" ? "text-accent-pink" : ""}>{request.mode === "live" ? "LIVE MODEL RUN" : "OFFLINE REHEARSAL"}</span> · {liveCalls.length} completed model calls ·{" "}
              {liveCalls.reduce((n: number, e: any) => n + (e.usage?.total_tokens ?? 0), 0).toLocaleString()} reported tokens
            </p>
          )}
        </div>
        <select
          aria-label="Select request"
          className="input !mt-0 w-auto max-w-full"
          value={request?.id ?? ""}
          onChange={(e) => {
            setRequestId(e.target.value);
            setSessionId("");
          }}
        >
          <option value="" disabled>
            No request yet
          </option>
          {requests.map((r) => (
            <option key={r.id} value={r.id}>
              {r.title.slice(0, 35)} · {r.mode}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {[{ id: "", label: "All activity" }, ...requestSessions.map((s) => ({ id: s.id, label: member(s.candidateId)?.name }))].map((f) => (
          <button
            key={f.id || "all"}
            onClick={() => setSessionId(f.id)}
            className={`rounded-full border px-3.5 py-1.5 text-xs transition-colors ${sessionId === f.id ? "border-accent-pink text-accent-pink" : "border-foreground/15 text-muted-foreground hover:border-foreground/40"}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-col divide-y divide-foreground/10" aria-live="polite">
        {!events.length && (
          <div className="py-12">
            <p className="mb-2 font-display text-2xl">No messages yet</p>
            <p className="max-w-md text-muted-foreground">Each agent will receive only its own profile and the messages in its conversation.</p>
          </div>
        )}
        {events.map((e) => {
          const from = member(e.from);
          return (
            <article key={e.id} className={`flex gap-4 ${e.type === "executing" ? "py-2.5 text-muted-foreground/70" : "py-5"}`}>
              <span className="mt-0.5 w-4 shrink-0 text-center font-mono text-sm text-muted-foreground">{e.type === "executing" ? "·" : e.type === "owner_decision" ? "✓" : "↗"}</span>
              <div className="min-w-0 flex-1">
                {e.type !== "executing" && (
                  <div className="mb-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                    <b className="font-medium">
                      {from?.name ? `${from.name}${e.actor ? "" : "’s agent"}` : "Coordinator"}
                      {e.to && e.to !== e.from ? ` → ${member(e.to)?.name}’s agent` : ""}
                    </b>
                    <span className={tagClass(e.type)}>{statusLabel(e.type)}</span>
                    <time className="ml-auto font-mono text-[11px] text-muted-foreground">{new Date(e.at).toLocaleTimeString("en-GB")}</time>
                  </div>
                )}
                <p className={e.type === "executing" ? "text-xs" : "leading-relaxed text-muted-foreground"}>{e.message}</p>
                {e.reason && (
                  <details className="mt-2">
                    <summary>Action basis &amp; evidence</summary>
                    <div className="mt-2 space-y-1.5 border-l border-foreground/10 pl-4 text-sm text-muted-foreground">
                      <p>{e.reason}</p>
                      {e.evidenceIds?.map((id: string) => {
                        const ev = from?.evidence.find((x: any) => x.id === id);
                        return (
                          ev && (
                            <a key={id} className="block text-foreground underline-offset-4 hover:underline" href={ev.url} target="_blank" rel="noreferrer">
                              {ev.title} ↗
                            </a>
                          )
                        );
                      })}
                      <small className="block font-mono text-[11px]">
                        Mode: {e.mode} · {e.model} · Tokens: {e.usage?.total_tokens ?? "not reported"}
                        {e.signature ? " · signed event" : ""}
                      </small>
                      {e.call && (
                        <small className="block font-mono text-[11px]">
                          Call {e.call.id.slice(0, 8)} · {(e.call.durationMs / 1000).toFixed(1)}s · Phase: {e.call.phase} · Context: {e.call.inputHash.slice(0, 12)}
                        </small>
                      )}
                    </div>
                  </details>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function Inspector({ app }: { app: CommonsApp }) {
  const { focused, synthetic } = app;
  return (
    <aside className="panel lg:col-span-4">
      <span className="eyebrow">Member context</span>
      {focused && (
        <>
          <h3 className="mt-3 font-display text-4xl">{focused.name}</h3>
          <p className="text-muted-foreground">{focused.role}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {focused.skills.map((s: string) => (
              <span key={s} className="chip">
                {s}
              </span>
            ))}
          </div>
          <h4 className="eyebrow mt-6 mb-2">Here to</h4>
          <p className="leading-relaxed">{focused.goals}</p>
          <h4 className="eyebrow mt-6 mb-2">{synthetic ? "Approved public context" : "Source-derived context"}</h4>
          <p className="leading-relaxed text-muted-foreground">{focused.context}</p>
          <h4 className="eyebrow mt-6 mb-2">Evidence</h4>
          {focused.evidence.length ? (
            focused.evidence.map((ev: any) => (
              <div key={ev.id} className="mb-3">
                <a className="underline-offset-4 hover:underline" href={ev.url} target="_blank" rel="noreferrer">
                  {ev.title} ↗
                </a>
                <small className="block text-xs text-muted-foreground">
                  {ev.kind === "synthetic" ? "Fictional fixture — not verified" : synthetic ? "Member supplied — not independently verified" : "Observed source — unverified self-report"}
                </small>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">No evidence supplied.</p>
          )}
          <p className="mt-6 border-t border-foreground/10 pt-4 text-xs text-muted-foreground">Private owner notes never appear in the graph or outbound model requests.</p>
        </>
      )}
    </aside>
  );
}
