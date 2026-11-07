import type { Component } from 'svelte';

export type StatusDotType = 'healthy' | 'degraded' | 'down' | 'checking' | 'unknown';
export type StatusDotSize = 'sm' | 'md' | 'lg';

export interface StatusDotProps {
	status?: StatusDotType;
	size?: StatusDotSize;
	pulse?: boolean;
	label?: string;
	class?: string;
	[key: string]: unknown;
}

declare const StatusDot: Component<StatusDotProps>;
export default StatusDot;
