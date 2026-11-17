export type FontSizeLevel = 'normal' | 'large' | 'larger';

export declare class FontSize {
	constructor(storageKey?: string);
	get current(): FontSizeLevel;
	set current(value: FontSizeLevel);
	cycle(): void;
	set(size: FontSizeLevel): void;
	reset(): void;
	/** Keeps `<html>` in sync with the font size level; returns a function that stops it. */
	attach(): () => void;
}

export declare function applyFontSize(value: FontSizeLevel, root?: HTMLElement): void;

export declare const fontSize: FontSize;
