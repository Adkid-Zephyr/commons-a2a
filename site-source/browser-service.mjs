import {Engine} from './lib/engine.mjs';
import {modelTurn} from './lib/model.mjs';
import {createDemo, createFollowup} from './lib/demo.mjs';
import {attentionBrief} from './lib/attention.mjs';
import initial from './recordings.json' with {type:'json'};

export const STORAGE_KEY = 'commons-public-demo-v1';
export function createDemoService(storage) {
  let persisted;
  try { persisted = JSON.parse(storage.getItem(STORAGE_KEY)); } catch {}
  if (!persisted || persisted.version !== 1) persisted = {version: 1, state: structuredClone(initial)};
  const store = {load: () => persisted.state, save: state => {
    persisted.state = state;
    try { storage.setItem(STORAGE_KEY, JSON.stringify(persisted)); } catch {}
  }};
  const turn = async (packet, mode) => {
    if (mode !== 'rehearsal') throw Error('Recorded model runs are read-only. Start an offline rehearsal.');
    await new Promise(resolve => setTimeout(resolve, 120));
    return modelTurn(packet, mode);
  };
  const app = new Engine(store, turn);
  const recorded = id => app.state.requests.find(r => r.id === id)?.mode === 'live';
  function editableSession(id) {
    const session = app.state.sessions.find(s => s.id === id);
    if (session && recorded(session.requestId)) throw Error('This is a recorded model run. Start a rehearsal to try approvals and handoff.');
  }
  return async function respond(url, options = {}) {
    const params = new URL(url, 'https://commons.invalid').searchParams;
    const reply = (data, status = 200) => new Response(JSON.stringify(data), {status, headers: {'Content-Type': 'application/json'}});
    try {
      if ((params.get('dataset') ?? 'synthetic') !== 'synthetic') throw Error('Only fictional community data is available in the public demo.');
      if (!options.method || options.method === 'GET') {
        if (params.get('profile')) return reply(app.profile(params.get('profile')));
        if (params.get('view') === 'attention') {
          const brief = attentionBrief(app.state, params.get('ownerId'), {mode: params.get('mode') ?? 'live', offset: Number(params.get('offset') ?? 0), limit: Number(params.get('limit') ?? 5)});
          for (const item of brief.items) if (item.mode === 'live') {
            item.actions = item.actions.filter(action => ['inspect_session', 'inspect_request'].includes(action));
            item.title = `Recorded outcome · ${item.counterpart?.name ?? 'community'}`;
          }
          return reply(brief);
        }
        return reply({...app.snapshot(), configured: false, publicDemo: true, datasets: [{id: 'synthetic', label: 'Fictional community · your demo session'}]});
      }
      if (options.method !== 'POST') throw Error('Unsupported method');
      const {action, ...body} = JSON.parse(options.body);
      if (['request', 'demo', 'clarify'].includes(action) && app.state.requests.length >= 50) throw Error('This demo session is full. Use Reset my demo in the guide.');
      if (action === 'request' || action === 'demo') {
        if ((body.request?.mode ?? body.mode) !== 'rehearsal') throw Error('Public visitors can run offline rehearsal only. Recorded model runs remain available to inspect.');
        const r = action === 'demo' ? createDemo(app, body) : app.createRequest(body.request);
        void app.run(r.id);
        return reply(r);
      }
      if (action === 'clarify') {
        editableSession(body.sessionId);
        const r = createFollowup(app, body); void app.run(r.id); return reply(r);
      }
      if (action === 'approve') { editableSession(body.sessionId); return reply(app.approve(body.sessionId, body.ownerId, body.decision)); }
      if (action === 'message') return reply(app.humanMessage(body.connectionId, body.ownerId, body.message));
      if (action === 'member') {
        if (app.state.requests.some(r => ['queued', 'running'].includes(r.status))) throw Error('Wait for the active rehearsal to finish.');
        if (!body.id && app.state.members.length >= 60) throw Error('This demo has reached its member limit. Reset your demo to start again.');
        return reply(body.id ? app.updateMember(body.id, body.profile) : app.addMember(body.profile));
      }
      throw Error('Unknown action');
    } catch (e) { return reply({error: e.message}, 400); }
  };
}

if (typeof window !== 'undefined') {
  const key = Symbol.for('commons.public.service');
  if (!window[key]) {
    let storage;
    try { storage = window.sessionStorage; } catch { const memory = new Map(); storage = {getItem: k => memory.get(k), setItem: (k,v) => memory.set(k,v)}; }
    const respond = createDemoService(storage);
    const nativeFetch = window.fetch.bind(window);
    window.fetch = (input, options) => {
      const url = new URL(typeof input === 'string' ? input : input.url, location.href);
      return url.origin === location.origin && url.pathname === '/api' ? respond(url.href, options) : nativeFetch(input, options);
    };
    window[key] = true;
  }
}
