"use client";

import { useEffect, useState } from "react";

// Shapes from GET /api (see docs/COLLABORATION.md). Only the fields the landing page reads.
export type Member = {
  id: string;
  name: string;
  role: string;
  skills: string[];
  availability: string;
  participation: string;
};

export type CommonsEvent = {
  id: string;
  seq: number;
  at?: string;
  requestId: string;
  sessionId?: string;
  from?: string;
  to?: string;
  type: string;
  message: string;
  reason?: string;
  mode?: string;
};

export type CommonsState = {
  dataset: string;
  members: Member[];
  requests: { id: string; mode: string; status: string }[];
  sessions: { id: string; status: string }[];
  events: CommonsEvent[];
  connections: { id: string }[];
};

// An agent writing to another agent; excludes digests, progress markers and outcomes.
export const isAgentMessage = (e: CommonsEvent) =>
  Boolean(e.from && e.to && e.from !== e.to && e.type !== "executing");

// Polls the local API, as the operator app does; there is no SSE/WebSocket yet.
export function useCommons(intervalMs = 3000) {
  const [state, setState] = useState<CommonsState | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const r = await fetch("/api?dataset=synthetic", { cache: "no-store" });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        if (!cancelled) {
          setState(d);
          setError("");
        }
      } catch (e: any) {
        if (!cancelled) setError(e.message || "API unavailable");
      }
    };
    load();
    const t = setInterval(load, intervalMs);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [intervalMs]);

  return { state, error };
}
