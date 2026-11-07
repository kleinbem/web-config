import { on } from 'svelte/events';
import { createSubscriber, MediaQuery } from 'svelte/reactivity';
import { THEME_STORAGE_KEY } from './initTheme.js';

function getStorage() {
	if (typeof window === 'undefined') return undefined;
	try {
		localStorage.getItem('dummy');
		return localStorage;
	} catch {
		return undefined;
	}
}

/**
 * Persisted reactive store backed by localStorage with cross-tab event synchronization.
 */
class Persisted {
	#key;
	#storage;
	#fallback;
	#version = $state(0);

	#subscribe = createSubscriber((update) => {
		if (typeof window === 'undefined') return () => {};
		return on(window, 'storage', (e) => {
			if (e.key === null || e.key === this.#key) {
				update();
			}
		});
	});

	/**
	 * @param {string} key
	 * @param {string} fallback
	 */
	constructor(key, fallback) {
		this.#key = key;
		this.#fallback = fallback;
		this.#storage = getStorage();
	}

	get current() {
		this.#subscribe();
		this.#version;

		if (!this.#storage && typeof window !== 'undefined') {
			this.#storage = getStorage();
		}

		return this.#storage?.getItem?.(this.#key) ?? this.#fallback;
	}

	set current(v) {
		if (!this.#storage && typeof window !== 'undefined') {
			this.#storage = getStorage();
		}
		if (v !== this.#storage?.getItem?.(this.#key)) {
			try {
				this.#storage?.setItem(this.#key, v);
			} catch {
				// storage access disabled
			}
			this.#version += 1;
		}
	}
}

/**
 * Modern theme controller with system preference tracking and localStorage persistence.
 */
export class Theme {
	#storageKey;
	#preference;
	#query;
	#system = $derived(this.#query?.current ? 'dark' : 'light');

	/**
	 * @param {string} [storageKey='fleet-theme']
	 */
	constructor(storageKey = THEME_STORAGE_KEY) {
		this.#storageKey = storageKey;
		this.#preference = new Persisted(storageKey, 'system');
		this.#query = new MediaQuery('prefers-color-scheme: dark', true);
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
		const order = ['system', 'light', 'dark'];
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
}

/**
 * Singleton theme controller instance for the fleet.
 */
export const theme = new Theme();
