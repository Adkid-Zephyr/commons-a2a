"use client";

import { colors, type CommonsApp } from "./use-commons-app";

export function MembersView({ app }: { app: CommonsApp }) {
  const { members, synthetic, openProfile } = app;
  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <p className="font-mono text-xs text-muted-foreground">{members.length} members · each has a separate agent identity</p>
        <button className="btn btn-primary" disabled={!synthetic} onClick={() => openProfile()}>
          ＋ Add consenting member
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {members.map((m, i) => (
          <article className="panel flex flex-col" key={m.id}>
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-medium text-black" style={{ background: colors[i % colors.length] }}>
                {m.name[0]}
              </span>
              <div>
                <h4 className="font-display text-3xl leading-none">{m.name}</h4>
                <p className="mt-1 text-sm text-muted-foreground">{m.role}</p>
              </div>
            </div>
            <span className="tag mt-5 self-start">{m.representation === "source_replay" ? "Source replay · no owner consent" : m.synthetic ? "Fictional fixture" : "Operator-imported profile"}</span>
            <p className="mt-4 leading-relaxed">{m.goals}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {m.skills.map((s: string) => (
                <span key={s} className="chip">
                  {s}
                </span>
              ))}
            </div>
            <small className="mt-4 block font-mono text-[11px] text-muted-foreground">
              {m.participation === "information_only" ? "Information only · no outreach" : `Available: ${m.availability}`} · {m.evidence.length} evidence items
            </small>
            <button className="btn mt-6 self-start" disabled={!synthetic} onClick={() => openProfile(m.id)}>
              Review profile &amp; permissions
            </button>
          </article>
        ))}
      </div>
    </>
  );
}
