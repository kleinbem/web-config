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
				return 'bg-status-success shadow-[0_0_8px_color-mix(in_srgb,var(--color-status-success)_50%,transparent)]';
			case 'degraded':
				return 'bg-status-warning shadow-[0_0_8px_color-mix(in_srgb,var(--color-status-warning)_50%,transparent)]';
			case 'down':
				return 'bg-status-danger shadow-[0_0_8px_color-mix(in_srgb,var(--color-status-danger)_50%,transparent)]';
			case 'checking':
				return 'bg-status-info shadow-[0_0_8px_color-mix(in_srgb,var(--color-status-info)_50%,transparent)] motion-safe:animate-pulse';
			default:
				return 'bg-muted/60';
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
		class={`rounded-full transition-colors shrink-0 ${sizeClass} ${colorClass} ${pulse || status === 'checking' ? 'motion-safe:animate-pulse' : ''}`}
	></span>
	<span class="sr-only">{statusLabel}</span>
</div>
