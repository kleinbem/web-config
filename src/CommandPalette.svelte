<script>
	/**
	 * @typedef {Object} CommandItem
	 * @property {string | number} id
	 * @property {string} title
	 * @property {string} [subtitle]
	 * @property {string} [category]
	 * @property {string} [icon]
	 * @property {string} [badge]
	 * @property {string} [meta]
	 * @property {string} [url]
	 * @property {boolean} [external]
	 * @property {string[]} [keywords]
	 * @property {function(CommandItem): void} [onSelect]
	 */

	let {
		items = [],
		open = $bindable(false),
		placeholder = 'Search commands, services, or actions... (Esc to close)',
		emptyText = 'No results found.',
		shortcut = true,
		onSelect,
		class: className = '',
		...restProps
	} = $props();

	let query = $state('');
	let selectedIndex = $state(0);
	let inputEl = $state(null);
	/** @type {HTMLElement | null} */
	let listEl = $state(null);
	const uid = $props.id();
	const listId = `${uid}-list`;
	/** @param {number} i */
	const optionId = (i) => `${uid}-opt-${i}`;

	let filtered = $derived.by(() => {
		const q = query.trim().toLowerCase();
		if (!q) return items;
		return items.filter((item) => {
			const inTitle = item.title?.toLowerCase().includes(q);
			const inSubtitle = item.subtitle?.toLowerCase().includes(q);
			const inCategory = item.category?.toLowerCase().includes(q);
			const inMeta = item.meta?.toLowerCase().includes(q);
			const inKeywords = item.keywords?.some((k) => k.toLowerCase().includes(q));
			return inTitle || inSubtitle || inCategory || inMeta || inKeywords;
		});
	});

	$effect(() => {
		if (!open) return;
		const previous = /** @type {HTMLElement | null} */ (document.activeElement);
		query = '';
		selectedIndex = 0;
		inputEl?.focus();
		return () => {
			previous?.focus?.();
		};
	});

	$effect(() => {
		// Reset selection when query changes
		query;
		selectedIndex = 0;
	});

	$effect(() => {
		listEl?.querySelector(`#${CSS.escape(optionId(selectedIndex))}`)?.scrollIntoView({ block: 'nearest' });
	});

	function selectItem(item) {
		if (!item) return;
		if (typeof item.onSelect === 'function') {
			item.onSelect(item);
		} else if (typeof onSelect === 'function') {
			onSelect(item);
		} else if (item.url) {
			if (item.external || /^https?:\/\//i.test(item.url)) {
				window.open(item.url, '_blank', 'noopener,noreferrer');
			} else {
				window.location.href = item.url;
			}
		}
		open = false;
	}

	function handleKeyDown(e) {
		if (!open) {
			if (!shortcut) return;
			const target = /** @type {HTMLElement | null} */ (document.activeElement);
			const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

			if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
				e.preventDefault();
				open = true;
			} else if (e.key === '/' && !isInput) {
				e.preventDefault();
				open = true;
			}
			return;
		}

		if (e.key === 'Escape') {
			e.preventDefault();
			open = false;
		} else if (e.key === 'Tab') {
			// The input is the only tab stop; results are reached with the arrow keys.
			e.preventDefault();
			inputEl?.focus();
		} else if (e.key === 'ArrowDown') {
			e.preventDefault();
			selectedIndex = (selectedIndex + 1) % Math.max(1, filtered.length);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			selectedIndex = (selectedIndex - 1 + filtered.length) % Math.max(1, filtered.length);
		} else if (e.key === 'Enter') {
			e.preventDefault();
			const selected = filtered[selectedIndex];
			if (selected) selectItem(selected);
		}
	}
</script>

<svelte:window onkeydown={handleKeyDown} />

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4 bg-zinc-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150 {className}"
		role="dialog"
		tabindex="-1"
		aria-modal="true"
		aria-label="Command Palette"
		onclick={(e) => {
			if (e.target === e.currentTarget) open = false;
		}}
		onkeydown={(e) => {
			if (e.key === 'Escape') open = false;
		}}
		{...restProps}
	>
		<div
			class="w-full max-w-xl rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden flex flex-col max-h-[75vh]"
		>
			<div class="flex items-center px-4 border-b border-zinc-200/80 dark:border-zinc-800/80">
				<svg class="w-4 h-4 text-zinc-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
				</svg>
				<input
					bind:this={inputEl}
					bind:value={query}
					type="text"
					role="combobox"
					aria-label="Search"
					aria-expanded="true"
					aria-controls={listId}
					aria-autocomplete="list"
					aria-activedescendant={filtered.length > 0 ? optionId(selectedIndex) : undefined}
					{placeholder}
					class="w-full py-3.5 px-3 text-sm bg-transparent outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
				/>
				<kbd class="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border border-zinc-200 dark:border-zinc-700">
					ESC
				</kbd>
			</div>

			<div
				bind:this={listEl}
				id={listId}
				role="listbox"
				aria-label="Results"
				class="overflow-y-auto p-2 divide-y divide-transparent"
			>
				{#if filtered.length === 0}
					<div class="py-12 text-center text-sm text-zinc-500">
						{emptyText}
					</div>
				{:else}
					{#each filtered as item, index (item.id)}
						{@const isSelected = index === selectedIndex}
						<button
							type="button"
							id={optionId(index)}
							role="option"
							aria-selected={isSelected}
							tabindex="-1"
							onmouseenter={() => (selectedIndex = index)}
							onclick={() => selectItem(item)}
							class="w-full text-left flex items-center justify-between p-2.5 rounded-xl text-sm transition-colors cursor-pointer {isSelected
								? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
								: 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}"
						>
							<div class="flex items-center gap-3 min-w-0">
								{#if item.icon}
									<span class="text-xl select-none shrink-0">{item.icon}</span>
								{/if}
								<div class="truncate">
									<div class="flex items-center gap-2">
										<span class="font-medium text-zinc-900 dark:text-zinc-100">{item.title}</span>
										{#if item.category}
											<span class="text-[10px] px-1.5 py-0.5 rounded bg-zinc-200/60 dark:bg-zinc-700/60 text-zinc-600 dark:text-zinc-400 font-mono">
												{item.category}
											</span>
										{/if}
										{#if item.badge}
											<span class="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono">
												{item.badge}
											</span>
										{/if}
									</div>
									{#if item.subtitle}
										<p class="text-xs text-zinc-500 truncate mt-0.5">{item.subtitle}</p>
									{/if}
								</div>
							</div>

							<div class="flex items-center gap-2 shrink-0 ml-3">
								{#if item.meta}
									<span class="text-[11px] font-mono text-zinc-400">{item.meta}</span>
								{/if}
								{#if isSelected}
									<span class="text-[11px] text-zinc-400 font-mono">↵ select</span>
								{/if}
							</div>
						</button>
					{/each}
				{/if}
			</div>

			<div class="px-4 py-2 bg-zinc-50 dark:bg-zinc-950/40 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
				<span>↑↓ to navigate</span>
				<span>↵ to select</span>
				<span>{filtered.length} results</span>
			</div>
		</div>
	</div>
{/if}
