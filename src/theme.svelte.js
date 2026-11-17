import { MediaQuery } from 'svelte/reactivity';
import { Persisted } from './persisted.svelte.js';
import { THEME_STORAGE_KEY } from './initTheme.js';

/**
 * Writes the resolved theme to the root element: `data-theme` plus the `dark` / `light` classes.
 * @param {'dark' | 'light'} value
 * @param {HTMLElement} [root]
 */
export function applyTheme(value, root = document.documentElement) {
	root.dataset.theme = value;
	root.classList.toggle('dark', value === 'dark');
	root.classList.toggle('light', value === 'light');
}

/**
 * Modern theme controller with system preference tracking and localStorage persistence.
 */
export class Theme {
	#storageKey;
	#preference;
	#query = new MediaQuery('prefers-color-scheme: dark', true);
	/** @type {'dark' | 'light'} */
	#system = $derived(this.#query.current ? 'dark' : 'light');

	/**
	 * @param {string} [storageKey='fleet-theme']
	 */
	constructor(storageKey = THEME_STORAGE_KEY) {
		this.#storageKey = storageKey;
		this.#preference = new Persisted(storageKey, 'system');
	}

	/**
	 * Explicit user preference ('system' | 'light' | 'dark').
	 * @returns {'system' | 'light' | 'dark'}
	 */
	get preference() {
		const val = this.#preference.current;
		return val === 'light' || val === 'dark' ? val : 'system';
	}

	/**
	 * Sets the explicit preference.
	 * @param {'system' | 'light' | 'dark'} value
	 */
	set preference(value) {
		if (value === 'system' || value === 'light' || value === 'dark') {
			this.#preference.current = value;
		}
	}

	/**
	 * Operating system / browser color scheme preference ('dark' | 'light').
	 * @returns {'dark' | 'light'}
	 */
	get system() {
		return this.#system;
	}

	/**
	 * Currently active theme resolved from preference and system setting.
	 * If set, resets preference to 'system' if the value matches system preference.
	 * @returns {'dark' | 'light'}
	 */
	get current() {
		return this.preference === 'system' ? this.#system : this.preference;
	}

	/**
	 * Sets active theme directly.
	 * @param {'dark' | 'light'} value
	 */
	set current(value) {
		if (value === 'light' || value === 'dark') {
			this.preference = value === this.#system ? 'system' : value;
		}
	}

	/**
	 * Alias for `current`.
	 * @returns {'dark' | 'light'}
	 */
	get resolved() {
		return this.current;
	}

	/**
	 * Toggles active theme between 'light' and 'dark'.
	 * Automatically reverts to 'system' when matching the system preference.
	 */
	toggle() {
		this.current = this.current === 'light' ? 'dark' : 'light';
	}

	/**
	 * Cycles explicit preference: system -> light -> dark -> system.
	 */
	cycle() {
		const order = /** @type {const} */ (['system', 'light', 'dark']);
		const nextIdx = (order.indexOf(this.preference) + 1) % order.length;
		this.preference = order[nextIdx];
	}

	/**
	 * Sets preference explicitly.
	 * @param {'system' | 'light' | 'dark'} preference
	 */
	set(preference) {
		this.preference = preference;
	}

	/**
	 * Keeps `<html>` in sync with the resolved theme. No-op on the server.
	 * @returns {() => void} stops the sync
	 */
	attach() {
		if (typeof document === 'undefined') return () => {};
		return $effect.root(() => {
			$effect(() => applyTheme(this.current));
		});
	}
}

/**
 * Singleton theme controller instance for the fleet. Importing it keeps `<html>` in sync,
 * so apps need no effect of their own.
 */
export const theme = new Theme();
theme.attach();
