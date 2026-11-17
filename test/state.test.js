import assert from 'node:assert/strict';
import { test } from 'node:test';
import { flushSync } from 'svelte';
import { fontSize } from '../src/fontSize.svelte.js';
import { Theme, theme } from '../src/theme.svelte.js';

const root = document.documentElement;

test('theme singleton keeps <html> in sync without a component', () => {
	flushSync();
	assert.equal(theme.preference, 'system');
	assert.equal(root.dataset.theme, 'light');

	theme.set('dark');
	flushSync();
	assert.equal(root.dataset.theme, 'dark');
	assert.ok(root.classList.contains('dark'));
	assert.ok(!root.classList.contains('light'));
	assert.equal(localStorage.getItem('fleet-theme'), 'dark');
});

test('toggle falls back to system when it matches the OS setting', () => {
	theme.set('dark');
	theme.toggle();
	assert.equal(theme.current, 'light');
	assert.equal(theme.preference, 'system');
});

test('unknown stored values are ignored', () => {
	localStorage.setItem('fleet-theme', 'pink');
	localStorage.setItem('fleet-font-size', 'huge');
	assert.equal(theme.preference, 'system');
	assert.equal(fontSize.current, 'normal');
});

test('font size singleton keeps <html> in sync', () => {
	fontSize.set('large');
	flushSync();
	assert.equal(root.dataset.fontSize, 'large');
	assert.ok(root.classList.contains('font-size-large'));

	fontSize.cycle();
	flushSync();
	assert.equal(root.dataset.fontSize, 'larger');
	assert.ok(!root.classList.contains('font-size-large'));
});

test('a custom controller owns <html> while attached, then hands back', () => {
	theme.set('dark');
	const custom = new Theme('custom-theme');
	custom.set('light');
	const stop = custom.attach();
	flushSync();
	assert.equal(root.dataset.theme, 'light');

	// A singleton change must not overwrite the custom controller's theme.
	theme.set('system');
	theme.set('dark');
	flushSync();
	assert.equal(root.dataset.theme, 'light');

	stop();
	flushSync();
	assert.equal(root.dataset.theme, 'dark');
});
