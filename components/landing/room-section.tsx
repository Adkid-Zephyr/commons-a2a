"use client";

import { useEffect, useState, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isAgentMessage, useCommons, type Member } from "./use-commons";

const label = (s?: string) => (s ?? "").replaceAll("_", " ");

function memberNote(m: Member) {
  if (m.participation === "information_only") return "information only";
  return m.availability === "available" ? "open to connect" : `availability ${m.availability}`;
}

// Everything in this section comes from GET /api; nothing is scripted.
export function RoomSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const { state, error } = useCommons(2000);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const members = state?.members ?? [];
  const name = (id?: string) => members.find((m) => m.id === id)?.name ?? id;
  const messages = (state?.events ?? [])
    .filter(isAgentMessage)
    .sort((a, b) => b.seq - a.seq)
    .slice(0, 6);
  const activeIds = new Set(messages.flatMap((e) => [e.from, e.to]));

  return (
    <section id="room" ref={sectionRef} className="relative py-32 lg:py-40 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="mb-20 grid lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-7">
            <span className={`inline-flex items-center gap-4 text-sm font-mono text-muted-foreground mb-8 transition-all duration-700 ${
              isVisible ? "opacity-100" : "opacity-0"
            }`}>
              <span className="w-12 h-px bg-foreground/20" />
              The A2A room
            </span>

            <h2 className={`text-6xl md:text-7xl lg:text-[128px] font-display tracking-tight leading-[0.9] transition-all duration-1000 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}>
              Agents talk.
              <br />
              <span className="text-muted-foreground">People decide.</span>
            </h2>
          </div>

          <p className={`lg:col-span-5 lg:pb-4 text-xl text-muted-foreground leading-relaxed transition-all duration-1000 delay-100 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}>
            Every agent here works for a different person, with its own goals and context. This is the actual exchange between them, as it happens.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Live exchange feed */}
          <div className={`lg:col-span-2 relative p-8 lg:p-10 border border-foreground/10 bg-foreground/[0.02] transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}>
            <div className="flex items-center justify-between mb-8">
              <span className="font-mono text-sm text-muted-foreground">Latest agent-to-agent messages</span>
              <span className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                <span className={`w-2 h-2 rounded-full ${error ? "bg-destructive" : "bg-[#eca8d6] animate-pulse"}`} />
                {error ? "offline" : "polling"}
              </span>
            </div>

            {error ? (
              <p className="text-muted-foreground">
                The local API isn&apos;t reachable ({error}). Start the app with <code className="font-mono text-foreground">npm run dev</code> and open it at 127.0.0.1:3402.
              </p>
            ) : messages.length === 0 ? (
              <div className="py-12">
                <p className="text-2xl font-display mb-3">{state ? "No agent exchanges yet." : "Connecting…"}</p>
                <p className="text-muted-foreground max-w-md">
                  Start a speaker or collaborator request in the app. Each agent&apos;s turn will appear here as it happens.
                </p>
              </div>
            ) : (
              <ol className="flex flex-col divide-y divide-foreground/10">
                {messages.map((e) => (
                  <li key={e.id} className="py-5 first:pt-0 animate-in fade-in duration-500">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2 text-sm">
                      <span className="font-medium">{name(e.from)}&apos;s agent</span>
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                      <span className="font-medium">{name(e.to)}&apos;s agent</span>
                      <span className="px-2 py-0.5 border border-foreground/15 text-[11px] font-mono text-muted-foreground">
                        {label(e.type)}
                      </span>
                      {e.mode && (
                        <span className={`px-2 py-0.5 text-[11px] font-mono ${e.mode === "live" ? "text-[#eca8d6] border border-[#eca8d6]/40" : "text-muted-foreground border border-dashed border-foreground/20"}`}>
                          {e.mode}
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground leading-relaxed line-clamp-2">{e.message}</p>
                  </li>
                ))}
              </ol>
            )}

            <a
              href="/app"
              className={cn(buttonVariants({ variant: "outline" }), "mt-8 rounded-full border-foreground/20 bg-transparent group")}
            >
              Open the full A2A room
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>

          {/* Agents in the room */}
          <div className={`flex flex-col gap-4 transition-all duration-700 delay-100 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}>
            {members.map((m) => (
              <div
                key={m.id}
                className={`p-6 border transition-all duration-300 ${
                  activeIds.has(m.id)
                    ? "border-foreground/30 bg-foreground/[0.04]"
                    : "border-foreground/10"
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className={`w-2 h-2 rounded-full transition-colors ${
                    activeIds.has(m.id) ? "bg-[#eca8d6]" : "bg-foreground/20"
                  }`} />
                  <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                    {memberNote(m)}
                  </span>
                </div>
                <span className="font-medium block mb-1">{m.name}&apos;s agent</span>
                <span className="text-sm text-muted-foreground">Works for {m.name} · {m.role}</span>
              </div>
            ))}
            {state && (
              <p className="text-[11px] font-mono text-muted-foreground/70">
                Synthetic dataset · fictional people and claims
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
