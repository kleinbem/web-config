import { Persisted } from './persisted.svelte.js';
import { FONT_SIZE_STORAGE_KEY } from './initFontSize.js';

const SIZE_CLASSES = ['small', 'normal', 'large', 'larger'].map((s) => `font-size-${s}`);

/**
 * Writes the font size level to the root element: `data-font-size` plus a `font-size-*` class.
 * @param {'normal' | 'large' | 'larger'} value
 * @param {HTMLElement} [root]
 */
export function applyFontSize(value, root = document.documentElement) {
	root.dataset.fontSize = value;
	root.classList.remove(...SIZE_CLASSES);
	root.classList.add(`font-size-${value}`);
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
		const order = /** @type {const} */ (['normal', 'large', 'larger']);
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

	/**
	 * Keeps `<html>` in sync with the font size level. No-op on the server.
	 * @returns {() => void} stops the sync
	 */
	attach() {
		if (typeof document === 'undefined') return () => {};
		return $effect.root(() => {
			$effect(() => applyFontSize(this.current));
		});
	}
}

/**
 * Singleton font size controller instance for the fleet. Importing it keeps `<html>` in sync.
 */
export const fontSize = new FontSize();
fontSize.attach();
