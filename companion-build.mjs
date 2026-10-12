// Builds a standalone demo from installed, unmodified Helix component sources.
// Run: node companion-build.mjs /absolute/path/to/agentic-platform-checkout
import { createRequire } from 'node:module';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile, writeFile } from 'node:fs/promises';
const out = dirname(fileURLToPath(import.meta.url));
const repo = process.argv[2];
if (!repo) throw new Error('Pass the local Helix checkout path.');
const base = resolve(repo);
const app = `${base}/apps/helix-one`;
const core = `${base}/packages/ui/ui-core/src`;
const alpha = `${base}/packages/ui/ui-core-alpha/src`;
const requireApp = createRequire(`${app}/package.json`);
const requireCore = createRequire(`${base}/packages/ui/ui-core/package.json`);
const { build } = await import(`${base}/node_modules/.pnpm/esbuild@0.28.1/node_modules/esbuild/lib/main.js`);
await build({
  entryPoints:[`${out}/companion.tsx`], outfile:`${out}/companion.js`, bundle:true,
  minify:true, sourcemap:false, jsx:'automatic', format:'iife', platform:'browser',
  define:{'process.env.NODE_ENV':'"production"'},
  nodePaths:[`${app}/node_modules`,`${base}/packages/ui/ui-core/node_modules`],
  alias:{
    react:dirname(requireApp.resolve('react/package.json')),
    'react-dom':dirname(requireApp.resolve('react-dom/package.json')),
    '@helix/button':`${core}/components/button/button.tsx`,
    '@helix/badge':`${core}/components/badge/badge.tsx`,
    '@helix/chat-card':`${alpha}/components/primitives/chat-content-card/chat-content-card.tsx`,
    '@agentic-platform/ui-core':`${core}/utils/index.ts`,
  },
});
const postcss = (await import(`${base}/node_modules/.pnpm/postcss@8.5.23/node_modules/postcss/lib/postcss.mjs`)).default;
const tailwind = (await import(`${base}/node_modules/.pnpm/@tailwindcss+postcss@4.2.2/node_modules/@tailwindcss/postcss/dist/index.mjs`)).default;
const css = `@import '${requireCore.resolve('tailwindcss') .replace(/dist\/lib\.js$/, 'index.css')}' source(none);
@import '${base}/packages/ui/design-tokens/src/tokens.css';
@import '${base}/packages/ui/design-tokens/src/layer-components.css';
@import '${base}/packages/ui/design-tokens/src/themes/helix-base.css';
@plugin '${requireCore.resolve('tailwindcss-react-aria-components')}';
@source '${core}/components/button';
@source '${core}/components/badge';
@source '${core}/utils';
@source '${alpha}/components/primitives/chat-content-card';
@source '${out}/companion.tsx';
${await readFile(`${out}/companion-source.css`,'utf8')}`;
const result = await postcss([tailwind({base:out,optimize:true})]).process(css,{from:`${out}/companion-source.css`,to:`${out}/companion.css`});
await writeFile(`${out}/companion.css`,result.css);
console.log('Built companion.js and companion.css using Helix component sources.');
