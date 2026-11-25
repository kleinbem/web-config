import { initFontSizeScript } from './initFontSize.js';
import { initThemeScript } from './initTheme.js';

const START = '<!-- web-config:init (written by `web-config sync`, do not edit) -->';
const END = '<!-- /web-config:init -->';
const BLOCK = /^([ \t]*)<!-- web-config:init\b[^\n]*-->[\s\S]*?<!-- \/web-config:init -->/m;
const HEAD = '%sveltekit.head%';
const HAND_WRITTEN = /localStorage\.getItem\(\s*['"]fleet-(theme|font-size)['"]/;

/** @param {string} text */
const toLf = (text) => text.replaceAll('\r\n', '\n');

/**
 * The blocking `<head>` block that sets theme and font size before first paint.
 * @param {string} [indent]
 * @param {string} [eol]
 */
export function renderInitBlock(indent = '', eol = '\n') {
	return [START, `<script>${initThemeScript}${initFontSizeScript}</script>`, END]
		.map((line) => indent + line)
		.join(eol);
}

/**
 * Returns `html` with the init block current: replaced in place, or inserted before
 * `%sveltekit.head%` when there is none yet. Keeps the file's line endings.
 * @param {string} html contents of `src/app.html`
 */
export function syncInitBlock(html) {
	const eol = html.includes('\r\n') ? '\r\n' : '\n';
	const block = html.match(BLOCK);
	if (block) return html.replace(BLOCK, () => renderInitBlock(block[1], eol));
	const at = html.indexOf(HEAD);
	if (at < 0) throw new Error('no %sveltekit.head% placeholder found');
	const lead = html.slice(html.lastIndexOf('\n', at - 1) + 1, at);
	// Placeholder on its own line: reuse its indent. Inline: give the block its own lines.
	const insert = /^[ \t]*$/.test(lead)
		? renderInitBlock(lead, eol).slice(lead.length) + eol + lead
		: eol + renderInitBlock('', eol) + eol;
	return html.slice(0, at) + insert + html.slice(at);
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
	else if (toLf(block[0]) !== renderInitBlock(block[1])) problems.push('web-config:init block is out of date');
	if (HAND_WRITTEN.test(html.replace(BLOCK, ''))) {
		problems.push('a hand-written fleet-theme / fleet-font-size script sits outside the block: remove it');
	}
	return problems;
}
