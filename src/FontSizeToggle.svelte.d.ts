import type { Component } from 'svelte';
import type { FontSize } from './fontSize.svelte.js';

export type FontSizeVariant = 'button' | 'segmented';

export interface FontSizeToggleProps {
	variant?: FontSizeVariant;
	showLabel?: boolean;
	class?: string;
	title?: string;
	'aria-label'?: string;
	fontSize?: FontSize;
	[key: string]: unknown;
}

declare const FontSizeToggle: Component<FontSizeToggleProps>;
export default FontSizeToggle;
