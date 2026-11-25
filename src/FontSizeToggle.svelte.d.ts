import type { Component } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';
import type { FontSize } from './fontSize.svelte.js';

export type FontSizeVariant = 'button' | 'segmented';

export interface FontSizeToggleProps extends Omit<HTMLButtonAttributes, 'class'> {
	variant?: FontSizeVariant;
	showLabel?: boolean;
	class?: string;
	fontSize?: FontSize;
}

declare const FontSizeToggle: Component<FontSizeToggleProps>;
export default FontSizeToggle;
