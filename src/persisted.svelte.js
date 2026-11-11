import { on } from 'svelte/events';
import { createSubscriber } from 'svelte/reactivity';

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
 * Reactive string value persisted in localStorage, synced across tabs. When storage is
 * unavailable or rejects a write, the value lives in memory so the UI still updates.
 */
export class Persisted {
	#key;
	#storage;
	#fallback;
	/** @type {string | undefined} */
	#memory = $state();
	#version = $state(0);

	#subscribe = createSubscriber((update) => {
		if (typeof window === 'undefined') return () => {};
		return on(window, 'storage', (e) => {
			if (e.key === null || e.key === this.#key) {
				this.#memory = undefined;
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

	#read() {
		if (!this.#storage && typeof window !== 'undefined') {
			this.#storage = getStorage();
		}
		try {
			return this.#storage?.getItem(this.#key) ?? undefined;
		} catch {
			return undefined;
		}
	}

	get current() {
		this.#subscribe();
		this.#version;
		return this.#memory ?? this.#read() ?? this.#fallback;
	}

	/** @param {string} v */
	set current(v) {
		if (v === this.current) return;
		try {
			if (!this.#storage) throw new Error('no storage');
			this.#storage.setItem(this.#key, v);
			this.#memory = undefined;
		} catch {
			this.#memory = v;
		}
		this.#version += 1;
	}
}
