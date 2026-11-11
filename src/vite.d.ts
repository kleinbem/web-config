import type { AdapterOptions } from '@sveltejs/adapter-static';
import type { Adapter, Config } from '@sveltejs/kit';
import type { CompileOptions } from 'svelte/compiler';
import type { PluginOption, ServerOptions, UserConfig } from 'vite';

export interface FleetWebConfigOptions {
  /**
   * Adapter to use. Defaults to 'static' (adapter-static configured for single-page app / embedded daemon).
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
   * Vite dev server options (e.g. proxy, port).
   */
  server?: ServerOptions;
  /**
   * Additional Vite plugins to include.
   */
  plugins?: PluginOption[];
}

export declare function defineWebConfig(options?: FleetWebConfigOptions): UserConfig;
