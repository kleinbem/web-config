<script lang="ts">
	import CommandPalette from '@kleinbem/web-config/components/CommandPalette';
	import type { CommandItem } from '@kleinbem/web-config/components/CommandPalette';
	import StatusDot from '@kleinbem/web-config/components/StatusDot';
	import FontSizeToggle from '@kleinbem/web-config/font-size/toggle';
	import { fontSize } from '@kleinbem/web-config/font-size/state';
	import { theme } from '@kleinbem/web-config/theme/state';
	import ThemeToggle from '@kleinbem/web-config/theme/toggle';

	let open = $state(false);

	const items: CommandItem[] = [
		{ id: 'dark', title: 'Dark theme', category: 'Theme', onSelect: () => theme.set('dark') },
		{ id: 'reset', title: 'Reset font size', category: 'Font', onSelect: () => fontSize.reset() }
	];
</script>

<main class="prose p-6">
	<h2>Fixture</h2>
	<p>Theme {theme.current} ({theme.preference}), font size {fontSize.current}.</p>
	<ThemeToggle disabled={false} />
	<ThemeToggle variant="cycle" showLabel />
	<ThemeToggle variant="segmented" showLabel />
	<FontSizeToggle />
	<FontSizeToggle variant="segmented" showLabel />
	<StatusDot status="healthy" pulse />
	<StatusDot status="down" size="sm" label="Offline" />
	<span class="badge badge-success">ok</span>
	<CommandPalette {items} bind:open />
</main>
