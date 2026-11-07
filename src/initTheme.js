/**
 * Default localStorage key used for persisting theme preference across the fleet.
 */
export const THEME_STORAGE_KEY = 'fleet-theme';

/**
 * Returns a self-contained, blocking JavaScript snippet suitable for inlining in `<head>`.
 * Resolves the theme immediately before the DOM paints to eliminate FOUC (flash of unstyled content).
 *
 * @param {string} [storageKey='fleet-theme']
 * @returns {string}
 */
export function getInitThemeScript(storageKey = THEME_STORAGE_KEY) {
	return `try{const p=localStorage.getItem('${storageKey}');const m=window.matchMedia('(prefers-color-scheme: dark)').matches;const t=(!p||p==='system')?(m?'dark':'light'):p;document.documentElement.dataset.theme=t;document.documentElement.classList.toggle('dark',t==='dark');document.documentElement.classList.toggle('light',t==='light');}catch(e){}`;
}

/**
 * Pre-compiled default init script for 'fleet-theme'.
 */
export const initThemeScript = getInitThemeScript();
