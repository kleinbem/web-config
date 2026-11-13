import { createHash } from 'node:crypto';
import { lstatSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import adapterStatic from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

function resolveBuildVersion() {
  const hash = createHash('sha256');
  let hashed = false;
  const walk = (entry) => {
    let st;
    try {
      st = lstatSync(entry);
    } catch {
      return;
    }
    if (st.isDirectory()) {
      for (const child of readdirSync(entry).sort()) {
        walk(join(entry, child));
      }
    } else if (st.isFile()) {
      hash.update(entry.replaceAll('\\', '/'));
      hash.update('\0');
      hash.update(readFileSync(entry));
      hash.update('\0');
      hashed = true;
    }
  };
  for (const root of ['package.json', 'package-lock.json', 'src', 'static']) {
    walk(root);
  }
  return hashed ? hash.digest('hex').slice(0, 12) : undefined;
}

/**
 * Standard fleet Vite configuration for SvelteKit 3 + Svelte 5.57 + Tailwind 4
 *
 * @param {Object} [options]
 * @param {import('@sveltejs/kit').Adapter | 'static'} [options.adapter]
 * @param {import('@sveltejs/adapter-static').AdapterOptions} [options.adapterOptions] Options passed to adapter-static if adapter === 'static'
 * @param {Object} [options.compilerOptions] Svelte compiler options override
 * @param {NonNullable<import('@sveltejs/kit/vite').Config['experimental']>} [options.experimental] SvelteKit experimental flags override
 * @param {import('@sveltejs/kit/vite').Config['version']} [options.version] SvelteKit build version config (defaults to deterministic source content digest)
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

  const buildVersion = version === undefined ? resolveBuildVersion() : undefined;
  const resolvedVersion = version ?? (buildVersion ? { name: buildVersion } : undefined);

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
