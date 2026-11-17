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
| `src/initHtml.js`, `bin/web-config.js` | `web-config sync` / `check`: keep the init block in a consumer's `src/app.html` current |
| `fixture/` | Minimal consumer app that CI type-checks and builds against the package |
| `test/` | `node:test` suites for the state modules and the init block |
| `src/*.svelte` (+ `.d.ts`) | `ThemeToggle`, `FontSizeToggle`, `StatusDot`, `CommandPalette` |

## Conventions

- Every public entry point is listed in `package.json` `exports` with its `.d.ts`; add both together.
- Plain JS with JSDoc, no build step: consumers compile the sources.
- `just check` runs `svelte-check` over `src/`, then installs the package into `fixture/` as npm
  would, type-checks and builds it. `just test` runs the unit tests. CI runs both.
- New exports get used in `fixture/src/routes/+page.svelte`, so CI covers them.
- No `prepare`, `build` or install scripts in `package.json`: npm would then run them, with the
  dev dependencies, on every consumer's install of the git dependency.
- A change here can break every consumer: check the API in `README.md` and keep it compatible.
