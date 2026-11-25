import type { Component } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export type StatusDotType = 'healthy' | 'degraded' | 'down' | 'checking' | 'unknown';
export type StatusDotSize = 'sm' | 'md' | 'lg';

export interface StatusDotProps extends Omit<HTMLAttributes<HTMLDivElement>, 'class'> {
	status?: StatusDotType;
	size?: StatusDotSize;
	pulse?: boolean;
	label?: string;
	class?: string;
}

declare const StatusDot: Component<StatusDotProps>;
export default StatusDot;
