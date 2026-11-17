import { initFontSizeScript } from './initFontSize.js';
import { initThemeScript } from './initTheme.js';

const START = '<!-- web-config:init (written by `web-config sync`, do not edit) -->';
const END = '<!-- /web-config:init -->';
const BLOCK = /^([ \t]*)<!-- web-config:init\b[^\n]*-->[\s\S]*?<!-- \/web-config:init -->/m;
const HEAD = /^([ \t]*)%sveltekit\.head%/m;
const HAND_WRITTEN = /localStorage\.getItem\(\s*['"]fleet-(theme|font-size)['"]/;

/**
 * The blocking `<head>` block that sets theme and font size before first paint.
 * @param {string} [indent]
 */
export function renderInitBlock(indent = '') {
	return [START, `<script>${initThemeScript}${initFontSizeScript}</script>`, END]
		.map((line) => indent + line)
		.join('\n');
}

/**
 * Returns `html` with the init block current: replaced in place, or inserted before
 * `%sveltekit.head%` when there is none yet.
 * @param {string} html contents of `src/app.html`
 */
export function syncInitBlock(html) {
	const block = html.match(BLOCK);
	if (block) return html.replace(BLOCK, () => renderInitBlock(block[1]));
	const head = html.match(HEAD);
	if (!head) throw new Error('no %sveltekit.head% placeholder found');
	return html.replace(HEAD, () => `${renderInitBlock(head[1])}\n${head[0]}`);
}

/**
 * Lists what is wrong with the init block in `html`; empty when it is current.
 * @param {string} html contents of `src/app.html`
 * @returns {string[]}
 */
export function checkInitBlock(html) {
	const problems = [];
	const block = html.match(BLOCK);
	if (!block) problems.push('no web-config:init block');
	else if (block[0] !== renderInitBlock(block[1])) problems.push('web-config:init block is out of date');
	if (HAND_WRITTEN.test(html.replace(BLOCK, ''))) {
		problems.push('a hand-written fleet-theme / fleet-font-size script sits outside the block: remove it');
	}
	return problems;
}
