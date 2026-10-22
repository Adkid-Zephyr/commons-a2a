import { Engine } from './engine.mjs';
import { createStore } from './store.mjs';
const key=Symbol.for('commons.engine');
export function engine(){return globalThis[key]??=new Engine(createStore());}
