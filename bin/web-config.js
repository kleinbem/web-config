#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { checkInitBlock, syncInitBlock } from '../src/initHtml.js';

const [command, file = 'src/app.html'] = process.argv.slice(2);

if (command !== 'sync' && command !== 'check') {
	console.error('usage: web-config <sync|check> [src/app.html]');
	process.exit(2);
}

let html = readFileSync(file, 'utf8');
if (command === 'sync') {
	const next = syncInitBlock(html);
	if (next !== html) {
		writeFileSync(file, next);
		console.log(`${file}: init block updated`);
	}
	html = next;
}

const problems = checkInitBlock(html);
for (const problem of problems) console.error(`${file}: ${problem}`);
if (problems.length) {
	if (command === 'check') console.error('run `npx web-config sync` to fix the block');
	process.exit(1);
}
