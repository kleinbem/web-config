import { on } from 'svelte/events';
import { createSubscriber } from 'svelte/reactivity';
import { FONT_SIZE_STORAGE_KEY } from './initFontSize.js';

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
 * Modern font size controller supporting accessibility text scaling and cross-tab sync.
 */
export class FontSize {
	#storageKey;
	#persisted;

	/**
	 * @param {string} [storageKey='fleet-font-size']
	 */
	constructor(storageKey = FONT_SIZE_STORAGE_KEY) {
		this.#storageKey = storageKey;
		this.#persisted = new Persisted(storageKey, 'normal');
	}

	/**
	 * Currently active font size level ('normal' | 'large' | 'larger').
	 * @returns {'normal' | 'large' | 'larger'}
	 */
	get current() {
		const val = this.#persisted.current;
		return val === 'large' || val === 'larger' ? val : 'normal';
	}

	/**
	 * Sets font size level.
	 * @param {'normal' | 'large' | 'larger'} value
	 */
	set current(value) {
		if (value === 'normal' || value === 'large' || value === 'larger') {
			this.#persisted.current = value;
		}
	}

	/**
	 * Cycles font size: normal -> large -> larger -> normal.
	 */
	cycle() {
		const order = ['normal', 'large', 'larger'];
		const nextIdx = (order.indexOf(this.current) + 1) % order.length;
		this.current = order[nextIdx];
	}

	/**
	 * Sets font size level explicitly.
	 * @param {'normal' | 'large' | 'larger'} size
	 */
	set(size) {
		this.current = size;
	}

	/**
	 * Resets font size to normal.
	 */
	reset() {
		this.current = 'normal';
	}
}

/**
 * Singleton font size controller instance for the fleet.
 */
export const fontSize = new FontSize();
