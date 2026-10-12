// Standalone reference embeds. Imports real Helix components without editing them.
// GoalReviewCard uses local fixture adapters; app services are deliberately
// unavailable. Familiarity answers are local React state, never Wallet writes.
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile, writeFile } from 'node:fs/promises';
const out = dirname(fileURLToPath(import.meta.url));
if (!process.argv[2]) throw new Error('Pass the Helix checkout path');
const repo = resolve(process.argv[2]);
const app = `${repo}/apps/helix-one`;
const core = `${repo}/packages/ui/ui-core/src`;
const alpha = `${repo}/packages/ui/ui-core-alpha/src`;
const wallet = `${repo}/packages/features/helix-wallet/src`;
const requireApp = createRequire(`${app}/package.json`);
const requireCore = createRequire(`${repo}/packages/ui/ui-core/package.json`);
const { build } = await import(`${repo}/node_modules/.pnpm/esbuild@0.28.1/node_modules/esbuild/lib/main.js`);
const unsupported = '() => { throw new Error("Live app services are unavailable in this read-only reference"); }';
const virtual = {
  '@agentic-platform/ui-core': ['utils/index.ts','components/button/button.tsx','components/badge/badge.tsx','components/input-group/input-group.tsx','components/spinner/spinner.tsx','components/slider/slider.tsx','components/popover/popover.tsx'].map(p=>`export * from '${core}/${p}';`).join('\n'),
  '@agentic-platform/ui-core-alpha': `export * from '${alpha}/components/primitives/chat-content-card/chat-content-card.tsx';`,
  '@agentic-platform/helix-common/starting-point': 'export const MAX_GOAL_SUB_SKILLS = 5;',
  '@agentic-platform/helix-conversation-ui': `export const defineConversationWidgetFocus = x => x;
    export const useConversationWidgetFocus = () => ({requestTarget(){}, target:() => () => {}});
    export const useConversationAnnouncement = () => {};
    export const useConversationAnnouncer = () => () => {};
    ${['formatSkillAddedAnnouncement','formatSkillRemovedAnnouncement','formatSkillSearchFailedAnnouncement','formatSkillSearchResultsAnnouncement','formatSkillSearchStartedAnnouncement'].map(n=>`export const ${n} = (...args) => args.join(' ');`).join('\n')}`,
  '@agentic-platform/telemetry/browser': `export const reportError = ${unsupported};`,
  '@tanstack/react-query': `const skills = [{skillId:'team-management',subSkillId:'direction',name:'Team Direction'},{skillId:'team-management',subSkillId:'coordination',name:'Work Coordination'},{skillId:'team-management',subSkillId:'collaboration',name:'Team Collaboration'}]; export const useQuery = ({queryKey}) => ({data:{candidates:skills.filter(s => s.name.toLowerCase().includes((queryKey[1] || '').toLowerCase()))},isFetching:false,isError:false,refetch:async()=>{}});`,
  '@/lib/api/client': `export const searchStartingPointSubSkills = ${unsupported};`,
  '@/lib/conversation/card-draft-store': `import { createStore } from 'zustand/vanilla'; export const createCardDraftStore = () => createStore(set => ({draft:null,draftSet:draft=>set({draft}),cleared:()=>set({draft:null})}));`,
  '@/lib/conversation/use-wallet-coverage': `export const useWalletCoverage = () => ({covered:new Set(),settled:true});`,
  '@agentic-platform/i18n': `const messages = ${await readFile(`${wallet}/i18n/en.json`,'utf8')}; export const useTranslation = () => ({t: (key, values = {}) => (messages[key] ?? key).replace(/\{(\w+)\}/g, (_,name) => values[name] ?? name)});`,
};
await build({
  entryPoints:[`${out}/widgets.tsx`], outfile:`${out}/widgets.js`, bundle:true, minify:true,
  sourcemap:false, jsx:'automatic', format:'iife', platform:'browser',
  define:{'process.env.NODE_ENV':'"production"'},
  nodePaths:[`${app}/node_modules`,`${repo}/packages/ui/ui-core/node_modules`],
  alias:{
    react:dirname(requireApp.resolve('react/package.json')),
    'react-dom':dirname(requireApp.resolve('react-dom/package.json')),
    '@source/goal-review':`${app}/src/components/conversation/goal-review-card.tsx`,
    '@source/footing':`${wallet}/components/skill-familiarity-sheet/skill-familiarity-sheet.tsx`,
    '@source/familiarity-slider':`${wallet}/components/skill-familiarity-sheet/familiarity-level-slider.tsx`,
    '@source/proficiency':`${alpha}/components/skill-proficiency-bar.tsx`,
  },
  plugins:[{name:'read-only-reference-adapters',setup(build){
    build.onResolve({filter:/^(@agentic-platform\/|@tanstack\/react-query$|@\/lib\/)/},args=>Object.hasOwn(virtual,args.path)?{path:args.path,namespace:'reference'}:undefined);
    build.onLoad({filter:/.*/,namespace:'reference'},args=>({contents:virtual[args.path],loader:'js',resolveDir:repo}));
  }}],
});
const postcss = (await import(`${repo}/node_modules/.pnpm/postcss@8.5.23/node_modules/postcss/lib/postcss.mjs`)).default;
const tailwind = (await import(`${repo}/node_modules/.pnpm/@tailwindcss+postcss@4.2.2/node_modules/@tailwindcss/postcss/dist/index.mjs`)).default;
const css = `@import '${requireCore.resolve('tailwindcss').replace(/dist\/lib\.js$/, 'index.css')}' source(none);
@import '${repo}/packages/ui/design-tokens/src/tokens.css';
@import '${repo}/packages/ui/design-tokens/src/layer-components.css';
@import '${repo}/packages/ui/design-tokens/src/themes/helix-base.css';
@plugin '${requireCore.resolve('tailwindcss-react-aria-components')}';
@source '${core}/components';
@source '${alpha}/components/primitives/chat-content-card';
@source '${alpha}/components/skill-proficiency-bar.tsx';
@source '${app}/src/components/conversation/goal-review-card.tsx';
@source '${wallet}/components/skill-familiarity-sheet';
@source '${out}/widgets.tsx';
@layer base { * { border-color:var(--border); } }
html,body { margin:0; background:transparent; color:var(--foreground); font-family:var(--font-sans); }
#root { padding:4px 4px 12px; }
/* Embedded references should be immediately readable, even off-screen. */
[data-slot="chat-content-card"] { opacity:1!important; transform:none!important; }
.fixture-note { margin:12px 4px 0; color:var(--muted-foreground); font-size:12px; line-height:1.5; }
@media(prefers-reduced-motion:reduce) { * { animation:none!important; transition:none!important; } }
`;
const result = await postcss([tailwind({base:out,optimize:true})]).process(css,{from:`${out}/widgets-source.css`,to:`${out}/widgets.css`});
await writeFile(`${out}/widgets.css`,result.css);
console.log('Built live reference widgets from unmodified Helix sources.');
