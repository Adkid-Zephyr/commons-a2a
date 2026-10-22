import test from 'node:test';
import assert from 'node:assert/strict';
import {demoHref, workspaceHref} from '../public/spider/navigation.js';

test('demo and community links preserve dataset, operator and request without leaking source text', () => {
  const context = {dataset: 'discord-replay', owner: 'source-2', requestId: 'run&1', sourceText: 'PRIVATE_SENTINEL'};
  const demo = new URL(demoHref(context), 'http://localhost');
  assert.equal(demo.pathname, '/demo');
  assert.equal(demo.searchParams.get('request'), 'run&1');
  const home = new URL(workspaceHref({...context, mode: 'rehearsal', tab: 'inbox'}), 'http://localhost');
  assert.equal(home.pathname, '/');
  assert.equal(home.searchParams.get('dataset'), 'discord-replay');
  assert.equal(home.searchParams.get('owner'), 'source-2');
  assert.equal(home.searchParams.get('mode'), 'rehearsal');
  assert.equal(home.searchParams.get('tab'), 'inbox');
  assert.equal(home.hash, '#community');
  assert(!home.href.includes('PRIVATE_SENTINEL'));
  assert.equal(new URL(workspaceHref({mode: 'invalid'}), home).searchParams.get('mode'), 'live');
});
