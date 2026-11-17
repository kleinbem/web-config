import { createHash } from 'node:crypto';
import { existsSync, lstatSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import adapterStatic from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, mergeConfig } from 'vite';
import { checkInitBlock } from './initHtml.js';

// Warns when the theme init block in src/app.html has drifted from the shared one.
/** @returns {import('vite').Plugin} */
function initBlockCheck() {
  let root = '.';
  return {
    name: 'web-config:init-check',
    configResolved(config) {
      root = config.root;
    },
    buildStart() {
      const file = join(root, 'src/app.html');
      if (!existsSync(file)) return;
      for (const problem of checkInitBlock(readFileSync(file, 'utf8'))) {
        this.warn(`src/app.html: ${problem} (fix: npx web-config sync)`);
      }
    }
  };
}

/** @param {string[]} sources app source and static asset directories */
function resolveBuildVersion(sources) {
  const hash = createHash('sha256');
  let hashed = false;
  /** @param {string} entry */
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
  for (const root of ['package.json', 'package-lock.json', ...sources]) {
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
 * @param {Partial<import('svelte/compiler').CompileOptions>} [options.compilerOptions] Svelte compiler options override
 * @param {NonNullable<import('@sveltejs/kit/vite').Config['experimental']>} [options.experimental] SvelteKit experimental flags override
 * @param {import('@sveltejs/kit/vite').Config['version']} [options.version] SvelteKit build version config (defaults to deterministic source content digest)
 * @param {import('vite').ServerOptions} [options.server] Vite dev server options
 * @param {import('vite').PluginOption[]} [options.plugins] Additional Vite plugins
 * @param {Omit<import('@sveltejs/kit/vite').Config, 'adapter' | 'version' | 'compilerOptions' | 'experimental'>} [options.kit] Other SvelteKit options (preprocess, paths, prerender, alias, ...)
 * @param {import('vite').UserConfig} [options.vite] Any other Vite config (preview, build, resolve, ...), merged with mergeConfig
 * @param {boolean} [options.initCheck] Warn when the init block in src/app.html is missing or stale (default true)
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
    plugins = [],
    kit = {},
    vite = {},
    initCheck = true
  } = options;

  const sources = [kit.files?.src ?? 'src', kit.files?.assets ?? 'static'];
  const buildVersion = version === undefined ? resolveBuildVersion(sources) : undefined;
  const resolvedVersion = version ?? (buildVersion ? { name: buildVersion } : undefined);

  let resolvedAdapter;
  // SvelteKit adapters are objects ({ name, adapt }), e.g. adapter-cloudflare().
  if (adapter && typeof adapter === 'object') {
    resolvedAdapter = adapter;
  } else if (adapter === 'static') {
    resolvedAdapter = adapterStatic({
      fallback: '200.html',
      pages: 'build',
      assets: 'build',
      precompress: false,
      strict: true,
      ...adapterOptions
    });
  }

  const base = defineConfig({
    plugins: [
      tailwindcss(),
      sveltekit({
        ...kit,
        ...(resolvedAdapter ? { adapter: resolvedAdapter } : {}),
        ...(resolvedVersion ? { version: resolvedVersion } : {}),
        compilerOptions: {
          fragments: 'html',
          ...compilerOptions,
          experimental: {
            async: true,
            ...compilerOptions.experimental
          }
        },
        // Runes for app code; the caller's own callback runs too and wins.
        dynamicCompileOptions(data) {
          const base = data.filename.includes('node_modules') ? undefined : { runes: true };
          const own = kit.dynamicCompileOptions?.(data);
          if (own instanceof Promise) return own.then((o) => (base || o ? { ...base, ...o } : undefined));
          return base || own ? { ...base, ...own } : undefined;
        },
        experimental: {
          forkPreloads: true,
          ...experimental
        }
      }),
      ...(initCheck ? [initBlockCheck()] : []),
      ...plugins
    ],
    server
  });

  return mergeConfig(base, vite);
}
