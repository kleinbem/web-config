<script>
	/**
	 * @typedef {'healthy' | 'degraded' | 'down' | 'checking' | 'unknown'} StatusDotType
	 * @typedef {'sm' | 'md' | 'lg'} StatusDotSize
	 */

	let {
		status = 'unknown',
		size = 'md',
		pulse = false,
		label,
		class: className = '',
		...restProps
	} = $props();

	const statusLabel = $derived.by(() => {
		if (label) return label;
		switch (status) {
			case 'healthy':
				return 'Operational';
			case 'degraded':
				return 'Degraded';
			case 'down':
				return 'Offline';
			case 'checking':
				return 'Checking...';
			default:
				return 'Unknown';
		}
	});

	const sizeClass = $derived.by(() => {
		switch (size) {
			case 'sm':
				return 'h-1.5 w-1.5';
			case 'lg':
				return 'h-3 w-3';
			case 'md':
			default:
				return 'h-2 w-2';
		}
	});

	const colorClass = $derived.by(() => {
		switch (status) {
			case 'healthy':
				return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]';
			case 'degraded':
				return 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]';
			case 'down':
				return 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]';
			case 'checking':
				return 'bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)] animate-pulse';
			default:
				return 'bg-zinc-400/60 dark:bg-zinc-600/60';
		}
	});
</script>

<div
	class={`inline-flex items-center gap-1.5 ${className}`}
	title={`Status: ${statusLabel}`}
	role="status"
	aria-label={statusLabel}
	{...restProps}
>
	<span
		class={`rounded-full transition-colors shrink-0 ${sizeClass} ${colorClass} ${pulse && status === 'healthy' ? 'animate-pulse' : ''}`}
	></span>
	<span class="sr-only">{statusLabel}</span>
</div>
