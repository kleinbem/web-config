<script>
	import { theme as defaultTheme } from './theme.svelte.js';

	/**
	 * @typedef {'button' | 'cycle' | 'segmented'} ToggleVariant
	 */

	let {
		variant = 'button',
		showLabel = false,
		class: className = '',
		theme = defaultTheme,
		onkeydown,
		...restProps
	} = $props();

	// Sync active theme to DOM document element on change
	$effect(() => {
		const active = theme.current;
		document.documentElement.dataset.theme = active;
		document.documentElement.classList.toggle('dark', active === 'dark');
		document.documentElement.classList.toggle('light', active === 'light');
	});

	function handleToggleClick() {
		if (variant === 'cycle') {
			theme.cycle();
		} else {
			theme.toggle();
		}
	}

	const isDark = $derived(theme.current === 'dark');
	const preference = $derived(theme.preference);

	const toggleAriaLabel = $derived.by(() => {
		if (variant === 'cycle') {
			return preference === 'system'
				? `Theme: System (${theme.system}). Click to switch to light theme.`
				: preference === 'light'
					? 'Theme: Light. Click to switch to dark theme.'
					: 'Theme: Dark. Click to switch to system theme.';
		}
		return isDark ? 'Switch to light theme' : 'Switch to dark theme';
	});

	const toggleTitle = $derived.by(() => {
		if (variant === 'cycle') {
			return `Theme: ${preference === 'system' ? `System (${theme.system})` : preference}`;
		}
		return isDark
			? `Switch to light theme (currently ${preference === 'system' ? 'system dark' : 'dark'})`
			: `Switch to dark theme (currently ${preference === 'system' ? 'system light' : 'light'})`;
	});

	/**
	 * Arrow/Home/End move the choice within a radio group (roving tabindex).
	 * @param {KeyboardEvent & { currentTarget: HTMLElement }} e
	 * @param {string[]} values
	 * @param {string} current
	 * @param {(value: any) => void} choose
	 */
	function radioKeydown(e, values, current, choose) {
		const i = values.indexOf(current);
		let next = -1;
		if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % values.length;
		else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i - 1 + values.length) % values.length;
		else if (e.key === 'Home') next = 0;
		else if (e.key === 'End') next = values.length - 1;
		if (next < 0) return;
		e.preventDefault();
		choose(values[next]);
		/** @type {HTMLElement | undefined} */ (e.currentTarget.querySelectorAll('[role="radio"]')[next])?.focus();
	}
</script>

{#snippet sunIcon()}
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
		<circle cx="12" cy="12" r="4" />
		<path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
	</svg>
{/snippet}

{#snippet moonIcon()}
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
		<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
	</svg>
{/snippet}

{#snippet monitorIcon()}
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
		<rect width="20" height="14" x="2" y="3" rx="2" />
		<path d="M8 21h8M12 17v4" />
	</svg>
{/snippet}

{#if variant === 'segmented'}
	<div
		role="radiogroup"
		onkeydown={(e) => {
			// Run the consumer's handler too; it can opt out with preventDefault().
			onkeydown?.(e);
			if (!e.defaultPrevented) radioKeydown(e, ['system', 'light', 'dark'], preference, (v) => theme.set(v));
		}}
		aria-label="Theme selection"
		class="inline-flex items-center p-0.5 rounded-lg border border-line bg-surface {className}"
		{...restProps}
	>
		<button
			type="button"
			role="radio"
			aria-checked={preference === 'system'}
			tabindex={preference === 'system' ? 0 : -1}
			aria-label="System theme"
			title="System ({theme.system})"
			onclick={() => theme.set('system')}
			class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer {preference === 'system' ? 'bg-surface-high text-heading shadow-xs' : 'text-muted hover:text-fg'}"
		>
			{@render monitorIcon()}
			{#if showLabel}<span>System</span>{/if}
		</button>
		<button
			type="button"
			role="radio"
			aria-checked={preference === 'light'}
			tabindex={preference === 'light' ? 0 : -1}
			aria-label="Light theme"
			title="Light theme"
			onclick={() => theme.set('light')}
			class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer {preference === 'light' ? 'bg-surface-high text-heading shadow-xs' : 'text-muted hover:text-fg'}"
		>
			{@render sunIcon()}
			{#if showLabel}<span>Light</span>{/if}
		</button>
		<button
			type="button"
			role="radio"
			aria-checked={preference === 'dark'}
			tabindex={preference === 'dark' ? 0 : -1}
			aria-label="Dark theme"
			title="Dark theme"
			onclick={() => theme.set('dark')}
			class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer {preference === 'dark' ? 'bg-surface-high text-heading shadow-xs' : 'text-muted hover:text-fg'}"
		>
			{@render moonIcon()}
			{#if showLabel}<span>Dark</span>{/if}
		</button>
	</div>
{:else}
	<button
		type="button"
		onclick={handleToggleClick}
		{onkeydown}
		aria-label={toggleAriaLabel}
		title={toggleTitle}
		class="inline-flex items-center justify-center gap-1.5 rounded-lg border border-line bg-surface hover:bg-surface-high text-fg hover:text-heading p-2 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent {className}"
		{...restProps}
	>
		{#if variant === 'cycle'}
			{#if preference === 'system'}
				{@render monitorIcon()}
				{#if showLabel}<span>Auto</span>{/if}
			{:else if preference === 'light'}
				{@render sunIcon()}
				{#if showLabel}<span>Light</span>{/if}
			{:else}
				{@render moonIcon()}
				{#if showLabel}<span>Dark</span>{/if}
			{/if}
		{:else}
			{#if isDark}
				{@render sunIcon()}
				{#if showLabel}<span>Light</span>{/if}
			{:else}
				{@render moonIcon()}
				{#if showLabel}<span>Dark</span>{/if}
			{/if}
		{/if}
	</button>
{/if}
