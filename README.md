# @kleinbem/web-config

Shared cutting-edge SvelteKit, Vite, and Tailwind configuration for the kleinbem fleet.

## Purpose

Enforces the fleet standard across all web applications and embedded dashboards (`revue`, `nix-detour`, `kleinbem-site`, etc.):
- **Svelte 5.57+**: Top-level `await` via `compilerOptions.experimental.async`, `fragments: 'html'`.
- **Strict Runes**: `dynamicCompileOptions` enforces `{ runes: true }` locally while allowing legacy `node_modules`.
- **SvelteKit 3.1+**: Inline Vite config, `forkPreloads: true`.
- **Tailwind CSS 4**: Modern Vite plugin without legacy configuration files.
- **jj Workspace Friendly**: Standard `rootDirs` configuration for TypeScript and `$types` resolution.

## Usage

### 1. `vite.config.ts`

```typescript
import { defineWebConfig } from '@kleinbem/web-config/vite';

// Embedded daemon SPA (default static adapter with fallback)
export default defineWebConfig({
  adapter: 'static',
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

### 2. `tsconfig.json`

```json
{
  "extends": "@kleinbem/web-config/tsconfig/svelte"
}
```

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
```

### 4. Zero-FOUC Initialization (`app.html`)

To prevent any flash of unstyled content during SSR, place the blocking init script inside `<head>` in `src/app.html`:

```html
<head>
  <!-- Initialize theme before body renders -->
  <script>
    %sveltekit.head%
  </script>
</head>
```

Or inject `initThemeScript` directly in `src/app.html` or a server hook:

```html
<script>
  try {
    const p = localStorage.getItem('fleet-theme');
    const m = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const t = (!p || p === 'system') ? (m ? 'dark' : 'light') : p;
    document.documentElement.dataset.theme = t;
    document.documentElement.classList.toggle('dark', t === 'dark');
    document.documentElement.classList.toggle('light', t === 'light');
  } catch (e) {}
</script>
```

Or import `initThemeScript` / `getInitThemeScript` programmatically:
```typescript
import { initThemeScript } from '@kleinbem/web-config/theme/init';
```

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

Zero-FOUC init script for `src/app.html`:
```html
<script>
  try {
    const s = localStorage.getItem('fleet-font-size');
    if (s && s !== 'normal') document.documentElement.dataset.fontSize = s;
  } catch (e) {}
</script>
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
