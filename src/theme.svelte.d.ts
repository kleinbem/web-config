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
}

export declare const theme: Theme;
