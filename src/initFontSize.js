/**
 * Default localStorage key used for persisting font size preference across the fleet.
 */
export const FONT_SIZE_STORAGE_KEY = 'fleet-font-size';

/**
 * Returns a self-contained, blocking JavaScript snippet suitable for inlining in `<head>`.
 * Resolves the font size immediately before the DOM paints to eliminate FOUC.
 *
 * @param {string} [storageKey='fleet-font-size']
 * @returns {string}
 */
export function getInitFontSizeScript(storageKey = FONT_SIZE_STORAGE_KEY) {
	const escapedKey = JSON.stringify(storageKey).replace(/</g, '\\u003c');
	return `try{const s=localStorage.getItem(${escapedKey});if(s==='large'||s==='larger'){document.documentElement.dataset.fontSize=s;document.documentElement.classList.add('font-size-'+s);}}catch(e){}`;
}

/**
 * Pre-compiled default init script for 'fleet-font-size'.
 */
export const initFontSizeScript = getInitFontSizeScript();
