import adapterStatic from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

/**
 * Standard fleet Vite configuration for SvelteKit 3 + Svelte 5.57 + Tailwind 4
 *
 * @param {Object} [options]
 * @param {import('@sveltejs/kit').Adapter | 'static'} [options.adapter]
 * @param {import('@sveltejs/adapter-static').AdapterOptions} [options.adapterOptions] Options passed to adapter-static if adapter === 'static'
 * @param {Object} [options.compilerOptions] Svelte compiler options override
 * @param {NonNullable<import('@sveltejs/kit').Config['experimental']>} [options.experimental] SvelteKit experimental flags override
 * @param {import('vite').ServerOptions} [options.server] Vite dev server options
 * @param {import('vite').PluginOption[]} [options.plugins] Additional Vite plugins
 * @returns {import('vite').UserConfig}
 */
export function defineWebConfig(options = {}) {
  const {
    adapter = 'static',
    adapterOptions = {},
    compilerOptions = {},
    experimental = {},
    server = {},
    plugins = []
  } = options;

  let resolvedAdapter;
  // SvelteKit adapters are objects ({ name, adapt }), e.g. adapter-cloudflare().
  if (adapter && (typeof adapter === 'object' || typeof adapter === 'function')) {
    resolvedAdapter = adapter;
  } else if (adapter === 'static') {
    resolvedAdapter = adapterStatic({
      fallback: 'index.html',
      pages: 'dist',
      assets: 'dist',
      precompress: false,
      strict: true,
      ...adapterOptions
    });
  }

  return defineConfig({
    plugins: [
      tailwindcss(),
      sveltekit({
        ...(resolvedAdapter ? { adapter: resolvedAdapter } : {}),
        compilerOptions: {
          experimental: {
            async: true
          },
          fragments: 'html',
          ...compilerOptions
        },
        dynamicCompileOptions({ filename }) {
          if (!filename.includes('node_modules')) {
            return { runes: true };
          }
        },
        experimental: {
          forkPreloads: true,
          ...experimental
        }
      }),
      ...plugins
    ],
    server
  });
}
