# @kleinbem/web-config

Shared cutting-edge SvelteKit, Vite, and Tailwind configuration for the kleinbem fleet.

## Purpose

Enforces the fleet standard across all web applications and embedded dashboards (`revue`, `nix-detour`, `kleinbem-site`, etc.):
- **Svelte 5.57+**: Top-level `await` via `compilerOptions.experimental.async`, `fragments: 'html'`.
- **Strict Runes**: `dynamicCompileOptions` enforces `{ runes: true }` locally while allowing legacy `node_modules`.
- **SvelteKit 3.1+**: Inline Vite config, `forkPreloads: true`.
- **Tailwind CSS 4**: Modern Vite plugin without legacy configuration files.
- **jj Workspace Friendly**: documented `rootDirs` setup for TypeScript and `$types` resolution.

## Usage

### 0. Install

```bash
npm install "github:kleinbem/web-config#v0.2.0"
```

Pin a release tag, not `main` or a commit, so every app names the same version. `github:` is the
form npm itself writes to `package.json`. If npm records the lock entry as `git+ssh://`, change it
to `git+https://github.com/kleinbem/web-config.git#<sha>` so CI and Nix builds need no SSH key.

### 1. `vite.config.ts`

```typescript
import { defineWebConfig } from '@kleinbem/web-config/vite';

// Static SPA: adapter-static writing to build/ with a 200.html fallback
export default defineWebConfig({
  server: {
    proxy: { '/api': 'http://127.0.0.1:8383' }
  }
});
```

For Cloudflare Workers (like `kleinbem-site`):
```typescript
import adapter from '@sveltejs/adapter-cloudflare';
import { defineWebConfig } from '@kleinbem/web-config/vite';

export default defineWebConfig({
  adapter: adapter()
});
```

Everything else passes through, so no app has to wrap the result:

```typescript
export default defineWebConfig({
  adapterOptions: { pages: 'dist', assets: 'dist' }, // adapter-static options
  kit: { paths: { base: '/app' } },                  // other SvelteKit options
  vite: { preview: { port: 4173 } }                  // any other Vite config, merged with mergeConfig
});
```

### 2. `tsconfig.json`

```json
{
  "extends": ["$app/tsconfig", "@kleinbem/web-config/tsconfig/svelte"],
  "compilerOptions": {
    "rootDirs": [".", "./.svelte-kit/types"]
  },
  "include": ["src", "test", "*"]
}
```

SvelteKit warns unless `$app/tsconfig` is extended directly, so list both. `rootDirs` and `include`
stay in your own file: TypeScript resolves them relative to the config that declares them, so in
the shared one they would point into `node_modules`.

### 3. Shared Theme & Styles (`app.css`)

```css
@import "tailwindcss";

/* Scan web-config components for Tailwind utilities (path relative to src/app.css) */
@source "../node_modules/@kleinbem/web-config";

/* Adaptive theme supporting system preference + toggle (or lock via /theme/dark or /theme/light) */
@import "@kleinbem/web-config/theme";

/* Universal resets, status badges, and prose markdown styles */
@import "@kleinbem/web-config/base.css";
@import "@kleinbem/web-config/badges.css";
@import "@kleinbem/web-config/prose.css";

/* Only if the app uses dark: itself: make it follow the active theme (data-theme set by the
   init script / ThemeToggle), not only the OS setting. The shared components don't need it. */
@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *, .dark, .dark *));
```

### 4. Zero-FOUC Initialization (`app.html`)

A blocking script in `<head>` sets theme and font size before first paint. Don't write it by hand:

```bash
npx web-config sync    # writes or updates the block in src/app.html, before %sveltekit.head%
npx web-config check   # fails when the block is missing, stale or duplicated by hand; run it in CI
```

`sync` owns everything between the `<!-- web-config:init -->` markers. `defineWebConfig()` also warns
during `vite dev` / `vite build` when the block has drifted (`initCheck: false` turns that off).

The raw snippets stay available as `initThemeScript` / `getInitThemeScript` from
`@kleinbem/web-config/theme/init` and `initFontSizeScript` from `@kleinbem/web-config/font-size/init`.

### 5. Theme Switcher (`<ThemeToggle />`)

Modeled after `svelte.dev` with support for system preferences, responsive reactivity, and cross-tab sync:

```svelte
<script>
  import ThemeToggle from '@kleinbem/web-config/theme/toggle';
</script>

<!-- Sleek single button: toggles dark/light & auto-reverts to system -->
<ThemeToggle />

<!-- Optional 3-way cycle (System -> Light -> Dark) -->
<ThemeToggle variant="cycle" />

<!-- Optional segmented control -->
<ThemeToggle variant="segmented" showLabel />
```

Or access the reactive theme controller directly:

```typescript
import { theme } from '@kleinbem/web-config/theme/state';

// Reactively inspect or mutate:
console.log(theme.preference); // 'system' | 'light' | 'dark'
console.log(theme.system);     // 'dark' | 'light'
console.log(theme.current);    // 'dark' | 'light' (resolved)

theme.toggle();                // toggles active theme
theme.cycle();                 // cycles preference
theme.set('system');           // sets explicit preference
```

Importing `theme` (or `fontSize`) is enough to keep `<html>` in sync (`data-theme`, `dark` / `light`
classes, `data-font-size`): no `$effect` in the app's layout, and no toggle has to be mounted.

### 6. Font Size Switcher (`<FontSizeToggle />`)

Accessibility typography control supporting proportional `rem` font scaling across the fleet:

```svelte
<script>
  import FontSizeToggle from '@kleinbem/web-config/font-size/toggle';
</script>

<!-- Sleek single 'A' button: cycles Normal (100%) -> Large (112.5%) -> Extra Large (125%) -->
<FontSizeToggle />

<!-- Optional segmented control -->
<FontSizeToggle variant="segmented" showLabel />
```

Or access the reactive font size controller:
```typescript
import { fontSize } from '@kleinbem/web-config/font-size/state';

console.log(fontSize.current); // 'normal' | 'large' | 'larger'
fontSize.cycle();              // cycles font size
fontSize.set('large');         // sets explicit size
```

### 7. Live Status Indicator (`<StatusDot />`)

Fleet-standard operational health indicator for services, daemons, and nodes:

```svelte
<script>
  import StatusDot from '@kleinbem/web-config/components/StatusDot';
</script>

<StatusDot status="healthy" pulse />
<StatusDot status="degraded" size="sm" />
<StatusDot status="down" />
```

### 8. Command Palette (`<CommandPalette />`)

Keyboard-first `⌘K` / `/` modal navigation for services, actions, and routes:

```svelte
<script>
  import CommandPalette from '@kleinbem/web-config/components/CommandPalette';

  let open = $state(false);

  const items = [
    {
      id: 'foyer',
      title: 'Foyer',
      subtitle: 'Homelab service launchpad',
      category: 'Portal',
      icon: '🏠',
      url: 'https://home.kleinbem.dev'
    },
    {
      id: 'reload',
      title: 'Refresh Data',
      category: 'Actions',
      onSelect: () => refresh()
    }
  ];
</script>

<CommandPalette {items} bind:open />
```
