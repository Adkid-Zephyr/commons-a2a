"use client";

import { Navigation } from "@/components/commons/navigation";
import { Hero } from "@/components/commons/hero";
import { NetworkView } from "@/components/commons/network-view";
import { InboxView } from "@/components/commons/inbox-view";
import { MembersView } from "@/components/commons/members-view";
import { ProfileModal } from "@/components/commons/profile-modal";
import { Footer } from "@/components/commons/footer";
import { isAgentMessage, useCommonsApp, type Tab } from "@/components/commons/use-commons-app";

const tabs: { id: Tab; label: string; heading: [string, string]; intro: string }[] = [
  { id: "network", label: "Agent network", heading: ["Good connections", "start here."], intro: "Watch personal agents find common ground. You decide when to step in." },
  { id: "inbox", label: "Your inbox", heading: ["Your attention,", "well spent."], intro: "Review the context, make the decision, then meet the person." },
  { id: "members", label: "Members", heading: ["Different people.", "Different goals."], intro: "Each member has their own context, boundaries and personal agent." },
];

export default function Home() {
  const app = useCommonsApp();
  const { data, error, setError, tab, setTab, dataset, synthetic, owner, setOwner, members, ownerPending, mode, openProfile } = app;
  const current = tabs.find((t) => t.id === tab)!;

  const show = (t: Tab) => {
    setTab(t);
    document.getElementById("app")?.scrollIntoView({ behavior: "smooth" });
  };
  const meet = () => {
    show("members");
    openProfile();
  };

  // Hero numbers come from the same polled state as the app; "—" until it loads.
  const count = (n: number) => (data ? String(n) : "—");
  const stats = [
    { value: count(members.length), label: "agents, each with its own context" },
    { value: count((data?.events ?? []).filter(isAgentMessage).length), label: "agent-to-agent messages" },
    { value: count(app.connections.length), label: "people connected after both approved" },
  ];

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <Navigation tab={tab} pending={ownerPending.length} onTab={show} onMeet={meet} canMeet={synthetic} />
      <Hero
        stats={stats}
        note={synthetic ? "Live from the local synthetic dataset · fictional demo members" : "Live from an anonymized source replay · not the real members"}
        canMeet={synthetic}
        onMeet={meet}
        onSee={() => show("network")}
      />

      <section id="app" className="scroll-mt-16 pt-24 lg:pt-32">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          {/* Heading + operator controls */}
          <div className="grid items-end gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <span className="eyebrow mb-6">
                <span className="h-px w-12 bg-foreground/30" />
                London builders · isolated test community
              </span>
              <h2 className="font-display text-6xl leading-[0.9] tracking-tight md:text-7xl lg:text-[104px]">
                {current.heading[0]}
                <br />
                <span className="text-muted-foreground">{current.heading[1]}</span>
              </h2>
              <p className="mt-6 max-w-xl text-xl leading-relaxed text-muted-foreground">{current.intro}</p>
            </div>
            {data && (
              <div className="panel lg:col-span-5">
                <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-emerald-300" />
                  Local sandbox · no Discord writes
                </span>
                <div className="grid gap-x-4 sm:grid-cols-2">
                  <label className="field">
                    Test dataset
                    <select className="input" value={dataset} onChange={(e) => window.location.assign("/?dataset=" + e.target.value)}>
                      {(data.datasets ?? [{ id: "synthetic", label: "Synthetic fixtures" }]).map((d: any) => (
                        <option key={d.id} value={d.id}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="field">
                    Test operator · switch member
                    <select className="input" value={owner} onChange={(e) => setOwner(e.target.value)}>
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} · {m.role}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">Switching is a demo control, not a login.</p>
              </div>
            )}
          </div>

          {/* Views */}
          <div className="mt-16 flex gap-8 overflow-x-auto border-b border-foreground/10">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`relative shrink-0 pb-4 text-sm transition-colors ${tab === t.id ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {t.label}
                {t.id === "inbox" && ownerPending.length > 0 && (
                  <span className="ml-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-pink px-1 font-mono text-[10px] text-black">{ownerPending.length}</span>
                )}
                <span className={`absolute bottom-0 left-0 h-px bg-accent-pink transition-all duration-300 ${tab === t.id ? "w-full" : "w-0"}`} />
              </button>
            ))}
          </div>

          {data && (
            <div className="mt-6 flex gap-3 border border-amber-300/20 bg-amber-300/[0.04] px-5 py-3.5 text-xs leading-relaxed text-amber-100/80">
              <span className="font-mono">◌</span>
              <p>
                <b className="font-medium text-amber-100">{mode === "rehearsal" ? "Rehearsal mode" : "Live model mode"}</b> ·{" "}
                {synthetic ? "Built-in people and project claims are fictional." : "Anonymized source replay: these test agents do not represent the real members. Availability and member consent are unknown."}{" "}
                {mode === "rehearsal" ? "Agent turns use deterministic test logic." : `Each agent makes an independent call to ${data.model?.name ?? "an unconfigured model"}.`}{" "}
                {synthetic
                  ? "Select a source replay dataset to test observed messages."
                  : `${data.sourceInfo?.messageCount ?? 0} source records · ${data.sourceInfo?.sourceKind} · Snapshot ${new Date(data.sourceInfo?.capturedAt).toLocaleString("en-GB", { timeZone: "Europe/London" })} London · Approvals disabled.`}
              </p>
            </div>
          )}

          {error && (
            <div className="mt-4 flex items-start justify-between gap-4 border border-red-400/40 bg-red-400/[0.06] px-5 py-3.5 text-sm text-red-200" role="alert">
              {error}
              <button aria-label="Dismiss" className="text-red-200/70 hover:text-red-100" onClick={() => setError("")}>
                ×
              </button>
            </div>
          )}

          <div key={tab} className="mt-8 animate-in fade-in duration-300">
            {!data ? (
              <div className="panel py-16">
                <p className="font-display text-3xl">{error ? "The local API isn’t reachable." : "Opening your community…"}</p>
              </div>
            ) : tab === "network" ? (
              <NetworkView app={app} />
            ) : tab === "inbox" ? (
              <InboxView app={app} />
            ) : (
              <MembersView app={app} />
            )}
          </div>
        </div>
      </section>

      <Footer />
      <ProfileModal app={app} />
    </main>
  );
}
