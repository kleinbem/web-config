// Compiles `.svelte.js` modules on import and fakes the few browser globals the state uses.
import { readFileSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { fileURLToPath } from 'node:url';
import { compileModule } from 'svelte/compiler';

registerHooks({
	load(/** @type {string} */ url, /** @type {any} */ context, /** @type {any} */ nextLoad) {
		if (!url.endsWith('.svelte.js') || url.includes('/node_modules/')) return nextLoad(url, context);
		const filename = fileURLToPath(url);
		const { js } = compileModule(readFileSync(filename, 'utf8'), { filename, generate: 'client' });
		return { format: 'module', shortCircuit: true, source: js.code };
	}
});

const store = new Map();
const classes = new Set();
const g = /** @type {any} */ (globalThis);

g.localStorage = {
	getItem: (/** @type {string} */ k) => store.get(k) ?? null,
	setItem: (/** @type {string} */ k, /** @type {string} */ v) => void store.set(k, String(v)),
	removeItem: (/** @type {string} */ k) => void store.delete(k),
	clear: () => store.clear()
};
g.document = {
	documentElement: {
		dataset: {},
		classList: {
			add: (/** @type {string[]} */ ...c) => c.forEach((x) => classes.add(x)),
			remove: (/** @type {string[]} */ ...c) => c.forEach((x) => classes.delete(x)),
			toggle: (/** @type {string} */ c, /** @type {boolean} */ on) => (on ? classes.add(c) : classes.delete(c)),
			contains: (/** @type {string} */ c) => classes.has(c)
		}
	}
};
g.window = Object.assign(globalThis, {
	matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
	addEventListener() {},
	removeEventListener() {}
});
