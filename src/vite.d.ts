import type { AdapterOptions } from '@sveltejs/adapter-static';
import type { Adapter } from '@sveltejs/kit';
import type { Config } from '@sveltejs/kit/vite';
import type { CompileOptions } from 'svelte/compiler';
import type { PluginOption, ServerOptions, UserConfig } from 'vite';

export interface FleetWebConfigOptions {
  /**
   * Adapter to use. Defaults to 'static': adapter-static writing to `build/` with a `200.html`
   * SPA fallback, so prerendered pages keep their own `index.html`.
   * Or pass an initialized Adapter instance (e.g. adapter-cloudflare).
   */
  adapter?: 'static' | Adapter;
  /**
   * Options passed to adapter-static if adapter is 'static'.
   */
  adapterOptions?: AdapterOptions;
  /**
   * Additional Svelte compiler options to merge.
   */
  compilerOptions?: Partial<CompileOptions>;
  /**
   * Additional SvelteKit experimental options to merge.
   */
  experimental?: Config['experimental'];
  /**
   * SvelteKit build version options. Defaults to a deterministic SHA-256 digest
   * of the app source (`package.json`, `package-lock.json`, `src`, `static`)
   * instead of `Date.now()` so Nix builds stay reproducible while deployments
   * with source changes still produce distinct client versions.
   */
  version?: Config['version'];
  /**
   * Vite dev server options (e.g. proxy, port).
   */
  server?: ServerOptions;
  /**
   * Additional Vite plugins to include.
   */
  plugins?: PluginOption[];
  /**
   * Other SvelteKit options (`preprocess`, `paths`, `prerender`, `alias`, ...). The options above
   * win over the same keys here.
   */
  kit?: Omit<Config, 'adapter' | 'version' | 'compilerOptions' | 'experimental'>;
  /**
   * Any other Vite config (`preview`, `build`, `resolve`, ...), merged over the fleet config
   * with Vite's `mergeConfig`.
   */
  vite?: UserConfig;
  /**
   * Warn when the theme init block in `src/app.html` is missing or stale. Defaults to true.
   */
  initCheck?: boolean;
}

export declare function defineWebConfig(options?: FleetWebConfigOptions): UserConfig;
