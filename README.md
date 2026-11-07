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

/* Adaptive theme supporting system preference + toggle (or lock via /theme/dark or /theme/light) */
@import "@kleinbem/web-config/theme";

/* Universal resets, status badges, and prose markdown styles */
@import "@kleinbem/web-config/base.css";
@import "@kleinbem/web-config/badges.css";
@import "@kleinbem/web-config/prose.css";
```

### 4. Theme Switcher (`<ThemeToggle />`)

Modeled after `svelte.dev` with support for system preferences, zero-FOUC SSR, and cross-tab sync:

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
