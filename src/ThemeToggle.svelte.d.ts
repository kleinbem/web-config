import type { Component } from 'svelte';
import type { Theme } from './theme.svelte.js';

export type ToggleVariant = 'button' | 'cycle' | 'segmented';

export interface ThemeToggleProps {
	variant?: ToggleVariant;
	showLabel?: boolean;
	class?: string;
	title?: string;
	'aria-label'?: string;
	theme?: Theme;
	[key: string]: unknown;
}

declare const ThemeToggle: Component<ThemeToggleProps>;
export default ThemeToggle;
