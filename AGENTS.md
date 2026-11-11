# @kleinbem/web-config

Shared SvelteKit, Vite and Tailwind configuration plus small Svelte components for the kleinbem
web apps (`foyer`, `attic-ui`, `kleinbem-site`, …). Consumers install it as a git dependency
(`git+https://github.com/kleinbem/web-config.git#main`), so every merge to `main` reaches them on
their next lock refresh.

## Layout

| Path | What lives here |
|---|---|
| `src/vite.js` (+ `vite.d.ts`) | `defineWebConfig()`: the fleet Vite + SvelteKit setup |
| `tsconfig.base.json`, `tsconfig.svelte.json` | Shared TypeScript settings (`./tsconfig.json`, `./tsconfig/svelte`) |
| `src/theme*.css`, `base.css`, `badges.css`, `prose.css` | Design tokens and shared styles |
| `src/theme.svelte.js`, `src/fontSize.svelte.js` | Reactive theme / font-size state, persisted in `localStorage` |
| `src/initTheme.js`, `src/initFontSize.js` | Blocking `<head>` snippets that avoid a flash of the wrong theme |
| `src/*.svelte` (+ `.d.ts`) | `ThemeToggle`, `FontSizeToggle`, `StatusDot`, `CommandPalette` |

## Conventions

- Every public entry point is listed in `package.json` `exports` with its `.d.ts`; add both together.
- Plain JS with JSDoc, no build step: consumers compile the sources.
- `just check` (= `npm run check`) syntax-checks the JS entry points; CI runs the same.
- A change here can break every consumer: check the API in `README.md` and keep it compatible.
