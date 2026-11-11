<script>
	import { fontSize as defaultFontSize } from './fontSize.svelte.js';

	/**
	 * @typedef {'button' | 'segmented'} FontSizeVariant
	 */

	let {
		variant = 'button',
		showLabel = false,
		class: className = '',
		fontSize = defaultFontSize,
		...restProps
	} = $props();

	// Sync active font size to document element
	$effect(() => {
		const size = fontSize.current;
		document.documentElement.dataset.fontSize = size;
		document.documentElement.classList.remove('font-size-normal', 'font-size-large', 'font-size-larger');
		document.documentElement.classList.add(`font-size-${size}`);
	});

	function handleToggleClick() {
		fontSize.cycle();
	}

	const currentSize = $derived(fontSize.current);

	const toggleAriaLabel = $derived.by(() => {
		return currentSize === 'normal'
			? 'Font size: Normal. Click to switch to large font.'
			: currentSize === 'large'
				? 'Font size: Large. Click to switch to extra large font.'
				: 'Font size: Extra Large. Click to reset to normal font.';
	});

	const toggleTitle = $derived.by(() => {
		return currentSize === 'normal'
			? 'Font size: Normal (100%)'
			: currentSize === 'large'
				? 'Font size: Large (112.5%)'
				: 'Font size: Extra Large (125%)';
	});
</script>

{#snippet aIcon()}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		class="w-4 h-4 shrink-0"
		aria-hidden="true"
	>
		<path d="m4 19 8-15 8 15" />
		<path d="M7 14h10" />
	</svg>
{/snippet}

{#if variant === 'segmented'}
	<div
		role="group"
		aria-label="Font size selection"
		class="inline-flex items-center p-0.5 rounded-lg border border-line bg-surface {className}"
		{...restProps}
	>
		<button
			type="button"
			aria-pressed={currentSize === 'normal'}
			aria-label="Normal font size (100%)"
			title="Normal (100%)"
			onclick={() => fontSize.set('normal')}
			class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer {currentSize === 'normal' ? 'bg-surface-high text-heading shadow-xs' : 'text-muted hover:text-fg'}"
		>
			<span>A</span>
			{#if showLabel}<span>Normal</span>{/if}
		</button>
		<button
			type="button"
			aria-pressed={currentSize === 'large'}
			aria-label="Large font size (112.5%)"
			title="Large (112.5%)"
			onclick={() => fontSize.set('large')}
			class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer {currentSize === 'large' ? 'bg-surface-high text-heading shadow-xs' : 'text-muted hover:text-fg'}"
		>
			<span>A+</span>
			{#if showLabel}<span>Large</span>{/if}
		</button>
		<button
			type="button"
			aria-pressed={currentSize === 'larger'}
			aria-label="Extra large font size (125%)"
			title="Extra large (125%)"
			onclick={() => fontSize.set('larger')}
			class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer {currentSize === 'larger' ? 'bg-surface-high text-heading shadow-xs' : 'text-muted hover:text-fg'}"
		>
			<span>A++</span>
			{#if showLabel}<span>Larger</span>{/if}
		</button>
	</div>
{:else}
	<button
		type="button"
		onclick={handleToggleClick}
		aria-label={toggleAriaLabel}
		title={toggleTitle}
		class="inline-flex items-center justify-center gap-1 rounded-lg border border-line bg-surface hover:bg-surface-high text-fg hover:text-heading p-2 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent {className}"
		{...restProps}
	>
		{@render aIcon()}
		{#if currentSize !== 'normal'}
			<span class="text-[10px] font-bold leading-none text-accent">
				{currentSize === 'large' ? '+' : '++'}
			</span>
		{/if}
		{#if showLabel}
			<span class="text-xs font-medium">
				{currentSize === 'normal' ? 'Normal' : currentSize === 'large' ? 'Large' : 'Larger'}
			</span>
		{/if}
	</button>
{/if}
