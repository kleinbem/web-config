import assert from 'node:assert/strict';
import { test } from 'node:test';
import { checkInitBlock, renderInitBlock, syncInitBlock } from '../src/initHtml.js';

const page = (/** @type {string} */ head) => `<html>\n\t<head>\n${head}\t\t%sveltekit.head%\n\t</head>\n</html>\n`;

test('sync inserts the block before %sveltekit.head% with its indent', () => {
	const out = syncInitBlock(page(''));
	assert.ok(out.includes(`${renderInitBlock('\t\t')}\n\t\t%sveltekit.head%`));
	assert.deepEqual(checkInitBlock(out), []);
});

test('sync is idempotent and repairs an edited block', () => {
	const synced = syncInitBlock(page(''));
	assert.equal(syncInitBlock(synced), synced);
	const edited = synced.replace('fleet-theme', 'other-key');
	assert.deepEqual(checkInitBlock(edited), ['web-config:init block is out of date']);
	assert.equal(syncInitBlock(edited), synced);
});

test('check reports a missing block and a leftover hand-written script', () => {
	const legacy = page(`\t\t<script>const p = localStorage.getItem('fleet-theme');</script>\n`);
	assert.equal(checkInitBlock(legacy).length, 2);
	assert.equal(checkInitBlock(syncInitBlock(legacy)).length, 1);
});

test('sync refuses a template without %sveltekit.head%', () => {
	assert.throws(() => syncInitBlock('<html></html>'));
});

test('sync handles a placeholder that shares its line with tags', () => {
	const out = syncInitBlock('<html><head>%sveltekit.head%</head><body>%sveltekit.body%</body></html>');
	assert.deepEqual(checkInitBlock(out), []);
	assert.equal(syncInitBlock(out), out);
	assert.ok(out.includes('-->\n%sveltekit.head%</head>'));
});

test('CRLF files stay CRLF and count as current', () => {
	const crlf = page('').replaceAll('\n', '\r\n');
	const out = syncInitBlock(crlf);
	assert.ok(!/[^\r]\n/.test(out));
	assert.deepEqual(checkInitBlock(out), []);
	assert.equal(syncInitBlock(out), out);
});
