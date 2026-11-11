import type { Component } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export interface CommandItem {
	id: string | number;
	title: string;
	subtitle?: string;
	category?: string;
	icon?: string;
	badge?: string;
	meta?: string;
	url?: string;
	external?: boolean;
	keywords?: string[];
	onSelect?: (item: CommandItem) => void;
}

export interface CommandPaletteProps
	extends Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'onselect'> {
	items?: CommandItem[];
	open?: boolean;
	placeholder?: string;
	emptyText?: string;
	shortcut?: boolean;
	onSelect?: (item: CommandItem) => void;
	class?: string;
}

declare const CommandPalette: Component<CommandPaletteProps>;
export default CommandPalette;
