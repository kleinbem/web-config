export type FontSizeLevel = 'normal' | 'large' | 'larger';

export declare class FontSize {
	constructor(storageKey?: string);
	get current(): FontSizeLevel;
	set current(value: FontSizeLevel);
	cycle(): void;
	set(size: FontSizeLevel): void;
	reset(): void;
}

export declare const fontSize: FontSize;
