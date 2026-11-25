export type ThemePreference = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'dark' | 'light';

export declare class Theme {
	constructor(storageKey?: string);
	get preference(): ThemePreference;
	set preference(value: ThemePreference);
	get system(): ResolvedTheme;
	get current(): ResolvedTheme;
	set current(value: ResolvedTheme);
	get resolved(): ResolvedTheme;
	toggle(): void;
	cycle(): void;
	set(preference: ThemePreference): void;
	/** Keeps `<html>` in sync with the resolved theme; returns a function that stops it. */
	attach(): () => void;
}

export declare function applyTheme(value: ResolvedTheme, root?: HTMLElement): void;

export declare const theme: Theme;
