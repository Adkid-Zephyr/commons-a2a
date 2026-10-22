"use client";

import { X } from "lucide-react";
import type { CommonsApp } from "./use-commons-app";

export function ProfileModal({ app }: { app: CommonsApp }) {
  const { editing, setEditing, editId, skills, setSkills, eTitle, setETitle, eUrl, setEUrl, eSummary, setESummary, consent, setConsent, busy, act, saveProfile } = app;
  if (!editing) return null;
  const set = (field: string, value: string) => setEditing({ ...editing, [field]: value });

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <section className="max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-foreground/15 bg-background p-6 lg:p-10" role="dialog" aria-modal="true" aria-label="Member initialization">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="eyebrow">Your personal agent</span>
            <h2 className="mt-3 font-display text-4xl lg:text-5xl">{editId ? "Review your context" : "Start with who you are"}</h2>
          </div>
          <button className="p-2 text-muted-foreground hover:text-foreground" aria-label="Close" onClick={() => setEditing(null)}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            act(saveProfile);
          }}
        >
          <div className="grid gap-x-4 sm:grid-cols-2">
            <label className="field">
              Name
              <input className="input" required value={editing.name} onChange={(e) => set("name", e.target.value)} />
            </label>
            <label className="field">
              Role
              <input className="input" required value={editing.role} onChange={(e) => set("role", e.target.value)} />
            </label>
          </div>
          <label className="field">
            Approved context · visible to the community
            <textarea className="input resize-y" required rows={3} placeholder="Paste a short introduction and the experience you want to share." value={editing.context} onChange={(e) => set("context", e.target.value)} />
          </label>
          <label className="field">
            What do you want from this community right now?
            <textarea className="input resize-y" required value={editing.goals} onChange={(e) => set("goals", e.target.value)} />
          </label>
          <label className="field">
            Skills / topics · comma separated
            <input className="input" required value={skills} onChange={(e) => setSkills(e.target.value)} />
          </label>
          <div className="grid gap-x-4 sm:grid-cols-2">
            <label className="field">
              Availability
              <select className="input" value={editing.availability} onChange={(e) => set("availability", e.target.value)}>
                <option value="unknown">Ask me first</option>
                <option value="available">Open to proposals</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </label>
            <label className="field">
              Participation
              <select className="input" value={editing.participation} onChange={(e) => set("participation", e.target.value)}>
                <option value="connect">Explore connections</option>
                <option value="information_only">Information only</option>
              </select>
            </label>
          </div>
          <label className="field">
            Private note · stored locally, never sent to agents
            <textarea className="input resize-y" value={editing.privateNote} onChange={(e) => set("privateNote", e.target.value)} />
          </label>

          <h4 className="eyebrow mt-8">Public evidence</h4>
          {editing.evidence.map((ev: any) => (
            <div className="mt-3 flex items-center justify-between gap-4 border border-foreground/10 px-4 py-2.5 text-sm" key={ev.id}>
              <span>{ev.title}</span>
              <button type="button" className="font-mono text-xs text-muted-foreground hover:text-foreground" onClick={() => setEditing({ ...editing, evidence: editing.evidence.filter((x: any) => x.id !== ev.id) })}>
                Remove
              </button>
            </div>
          ))}
          <div className="grid gap-x-4 sm:grid-cols-2">
            <label className="field">
              New evidence title
              <input className="input" value={eTitle} onChange={(e) => setETitle(e.target.value)} required={Boolean(eUrl)} />
            </label>
            <label className="field">
              Public HTTPS link
              <input className="input" type="url" value={eUrl} onChange={(e) => setEUrl(e.target.value)} placeholder="https://github.com/…" />
            </label>
          </div>
          <label className="field">
            What does this demonstrate?
            <input className="input" value={eSummary} onChange={(e) => setESummary(e.target.value)} required={Boolean(eUrl)} />
          </label>
          <label className="mt-6 flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
            <input type="checkbox" className="mt-1 accent-[#eca8d6]" required checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            I am using fictional data or have permission to use this profile and share the approved context with the configured model. Meetings still require approval.
          </label>
          <button className="btn btn-primary mt-8 h-12 w-full" disabled={busy}>
            Save personal agent ↗
          </button>
        </form>
      </section>
    </div>
  );
}
