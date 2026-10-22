"use client";

import { useEffect, useState } from "react";

// All app state and API calls; the views in this folder only render it.
// Contract: docs/COLLABORATION.md. There is no SSE/WebSocket, so state is polled.

export type Tab = "network" | "inbox" | "members";

export const blank = { name: "", role: "", context: "", goals: "", skills: [], availability: "unknown", participation: "connect", privateNote: "", evidence: [], consent: true };
export const colors = ["#eca8d6", "#a78bfa", "#67e8f9", "#fbbf24", "#86efac"];
export const statusLabel = (s: string) => s?.replaceAll("_", " ");

// An agent writing to another agent; excludes digests, progress markers and outcomes.
export const isAgentMessage = (e: any) => Boolean(e.from && e.to && e.from !== e.to && e.type !== "executing");

export function tagClass(type: string) {
  if (["decline", "declined", "error"].includes(type)) return "tag tag-bad";
  if (["clarification", "needs_info"].includes(type)) return "tag tag-warn";
  if (["connected", "human_handoff"].includes(type)) return "tag tag-good";
  return "tag";
}

export function useCommonsApp() {
  const [dataset, setDataset] = useState("synthetic");
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("network");
  const [owner, setOwner] = useState("maya");
  const [selected, setSelected] = useState("");
  const [requestId, setRequestId] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState("live");
  const [kind, setKind] = useState("speaker");
  const [title, setTitle] = useState("Who can share a working agent payments demo?");
  const [details, setDetails] = useState("A 20-minute practical talk at our London meetup next Thursday, followed by a 10-minute Q&A. Topic and time must be confirmed by the speaker.");
  const [topics, setTopics] = useState("payments, agents");
  const [source, setSource] = useState("");
  const [editing, setEditing] = useState<any>(null);
  const [editId, setEditId] = useState("");
  const [skills, setSkills] = useState("");
  const [eTitle, setETitle] = useState("");
  const [eUrl, setEUrl] = useState("");
  const [eSummary, setESummary] = useState("");
  const [consent, setConsent] = useState(false);
  const [chat, setChat] = useState("");

  async function refresh() {
    try {
      const r = await fetch(`/api?dataset=${dataset}`);
      const d = await r.json();
      if (!r.ok) throw Error(d.error);
      if ((new URLSearchParams(window.location.search).get("dataset") ?? "synthetic") === dataset) setData(d);
    } catch (e: any) {
      setError(e.message);
    }
  }
  useEffect(() => {
    setDataset(new URLSearchParams(window.location.search).get("dataset") ?? "synthetic");
  }, []);
  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 1100);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataset]);
  useEffect(() => {
    if (data?.dataset && data.dataset !== "synthetic") {
      const sample = data.sourceInfo?.requests?.[0];
      setOwner(sample?.ownerId ?? data.members[0]?.id);
      if (sample) {
        setKind(sample.kind);
        setTitle(sample.title);
        setDetails(sample.details);
        setTopics(sample.topics.join(", "));
      }
    }
  }, [data?.dataset]);

  async function post(body: any) {
    setError("");
    const r = await fetch(`/api?dataset=${dataset}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const d = await r.json();
    if (!r.ok) throw Error(d.error);
    await refresh();
    return d;
  }
  async function act(fn: () => Promise<any>) {
    setBusy(true);
    try {
      await fn();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  const members: any[] = data?.members ?? [];
  const requests: any[] = data?.requests ?? [];
  const sessions: any[] = data?.sessions ?? [];
  const connections: any[] = data?.connections ?? [];
  const request = requests.find((r) => r.id === requestId) ?? requests.at(-1);
  const requestSessions = sessions.filter((s) => s.requestId === request?.id);
  const events: any[] = (data?.events ?? []).filter((e: any) => e.requestId === request?.id && (!sessionId || e.sessionId === sessionId));
  const liveCalls: any[] = (data?.events ?? []).filter((e: any) => e.requestId === request?.id && e.call);
  const member = (id: string) => members.find((m) => m.id === id);
  const focused = member(selected) || member(owner);
  const activeEvent = (data?.events ?? []).filter((e: any) => e.requestId === request?.id).at(-1);
  const ownerPending = sessions.filter((s) => s.status === "awaiting_approval" && s.approvals[owner] === "pending");
  const synthetic = dataset === "synthetic";
  const running = requests.some((r) => r.status === "running");

  async function openProfile(id = "") {
    setError("");
    try {
      let p: any = blank;
      if (id) {
        const r = await fetch(`/api?dataset=${dataset}&profile=${id}`);
        p = await r.json();
        if (!r.ok) throw Error(p.error);
      }
      setEditing({ ...p });
      setEditId(id);
      setSkills((p.skills ?? []).join(", "));
      setETitle("");
      setEUrl("");
      setESummary("");
      setConsent(false);
    } catch (e: any) {
      setError(e.message);
    }
  }
  async function saveProfile() {
    const ev = [...(editing.evidence ?? [])];
    if (eUrl) ev.push({ id: crypto.randomUUID(), title: eTitle, url: eUrl, summary: eSummary, kind: "member_provided" });
    const p = { ...editing, skills: skills.split(",").map((s) => s.trim()).filter(Boolean), evidence: ev, consent };
    const r = await post({ action: "member", id: editId || undefined, profile: p });
    setOwner(r.id);
    setEditing(null);
  }
  function chooseScenario(value: string) {
    setKind(value);
    if (value === "speaker") {
      setTitle("Who can share a working agent payments demo?");
      setDetails("A 20-minute practical talk at our London meetup next Thursday, followed by a 10-minute Q&A. Topic and time must be confirmed by the speaker.");
      setTopics("payments, agents");
      setOwner("maya");
    } else {
      setTitle("Looking for a frontend collaborator");
      setDetails("Help improve an agent-payment demo for two hours this week. We need an accessible React UI. No ongoing maintenance commitment is expected.");
      setTopics("frontend, react");
      setOwner("leo");
    }
  }
  function submitRequest() {
    return act(async () => {
      const r = await post({ action: "request", request: { ownerId: owner, kind, title, details, topics: topics.split(",").map((s) => s.trim()).filter(Boolean), sourceUrl: source, authorized: true, mode, idempotencyKey: crypto.randomUUID() } });
      setRequestId(r.id);
      setSessionId("");
    });
  }
  function decide(id: string, decision: "approved" | "declined") {
    return act(() => post({ action: "approve", sessionId: id, ownerId: owner, decision }));
  }
  function sendMessage(connectionId: string) {
    return act(async () => {
      await post({ action: "message", connectionId, ownerId: owner, message: chat });
      setChat("");
    });
  }
  function inspect(s: any) {
    setRequestId(s.requestId);
    setSessionId(s.id);
    setTab("network");
  }

  return {
    dataset, data, error, setError, tab, setTab, owner, setOwner, selected, setSelected,
    requestId, setRequestId, sessionId, setSessionId, busy, mode, setMode, kind, title, setTitle,
    details, setDetails, topics, setTopics, source, setSource, editing, setEditing, editId,
    skills, setSkills, eTitle, setETitle, eUrl, setEUrl, eSummary, setESummary, consent, setConsent,
    chat, setChat, members, requests, sessions, connections, request, requestSessions, events,
    liveCalls, member, focused, activeEvent, ownerPending, synthetic, running,
    act, openProfile, saveProfile, chooseScenario, submitRequest, decide, sendMessage, inspect,
  };
}

export type CommonsApp = ReturnType<typeof useCommonsApp>;
