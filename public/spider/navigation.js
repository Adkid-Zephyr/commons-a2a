// Share only navigation context; never put source text or private data in URLs.
export function workspaceHref({dataset = 'synthetic', owner = '', requestId = '', mode = 'live', tab = 'network'} = {}) {
  const params = new URLSearchParams({dataset, tab});
  if (owner) params.set('owner', owner);
  if (requestId) params.set('request', requestId);
  params.set('mode', mode === 'rehearsal' ? 'rehearsal' : 'live');
  return `/?${params}#community`;
}

export function demoHref({dataset = 'synthetic', owner = '', requestId = ''} = {}) {
  const params = new URLSearchParams({dataset});
  if (owner) params.set('owner', owner);
  if (requestId) params.set('request', requestId);
  return `/demo?${params}`;
}
