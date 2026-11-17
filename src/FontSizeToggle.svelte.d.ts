import type { Component } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { FontSize } from './fontSize.svelte.js';

export type FontSizeVariant = 'button' | 'segmented';

export interface FontSizeToggleProps extends Omit<HTMLAttributes<HTMLElement>, 'class'> {
	variant?: FontSizeVariant;
	showLabel?: boolean;
	class?: string;
	fontSize?: FontSize;
}

declare const FontSizeToggle: Component<FontSizeToggleProps>;
export default FontSizeToggle;
