import type { Component } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { Theme } from './theme.svelte.js';

export type ToggleVariant = 'button' | 'cycle' | 'segmented';

export interface ThemeToggleProps extends Omit<HTMLAttributes<HTMLElement>, 'class'> {
	variant?: ToggleVariant;
	showLabel?: boolean;
	class?: string;
	theme?: Theme;
}

declare const ThemeToggle: Component<ThemeToggleProps>;
export default ThemeToggle;
