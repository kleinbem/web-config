import { readFileSync } from 'node:fs';
import adapterStatic from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

function resolvePackageVersion() {
  if (process.env.npm_package_version) return process.env.npm_package_version;
  try {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    if (typeof pkg.version === 'string' && pkg.version) return pkg.version;
  } catch {}
  return undefined;
}

/**
 * Standard fleet Vite configuration for SvelteKit 3 + Svelte 5.57 + Tailwind 4
 *
 * @param {Object} [options]
 * @param {import('@sveltejs/kit').Adapter | 'static'} [options.adapter]
 * @param {import('@sveltejs/adapter-static').AdapterOptions} [options.adapterOptions] Options passed to adapter-static if adapter === 'static'
 * @param {Object} [options.compilerOptions] Svelte compiler options override
 * @param {NonNullable<import('@sveltejs/kit/vite').Config['experimental']>} [options.experimental] SvelteKit experimental flags override
 * @param {import('@sveltejs/kit/vite').Config['version']} [options.version] SvelteKit build version config (defaults to package.json version for reproducible builds)
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
    version,
    server = {},
    plugins = []
  } = options;

  const pkgVersion = resolvePackageVersion();
  const resolvedVersion = version ?? (pkgVersion ? { name: pkgVersion } : undefined);

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
        ...(resolvedVersion ? { version: resolvedVersion } : {}),
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
