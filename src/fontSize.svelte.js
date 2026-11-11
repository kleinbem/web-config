import { Persisted } from './persisted.svelte.js';
import { FONT_SIZE_STORAGE_KEY } from './initFontSize.js';

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
