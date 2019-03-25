#!/usr/bin/env node

const rollup = require('rollup');
const rollupPluginCommonJS = require('rollup-plugin-commonjs');


async function repro() {
  console.info('About to `rollup.rollup`...');
  const bundle = await rollup.rollup({
    input: ['code/test.js'],
    plugins: [
      // nb. This plugin which excludes virtual modules works around this issue (although without it
      // the code still halts).
      {
        resolveId(id, importer) {
          if (id.startsWith('\0')) {
            console.info('Excluding internal module', id);
          //  return false;
// nb. The above line fixes the problem but generates additional virtual imports
// e.g.
//    import './test-other.js';
//    import require$$0 from 'commonjs-proxy:./test-other.js';

// we can remove the prefix safely here, AND mark as external, and the plugin seems to be sensible
// e.g.
//    import require$$0 from './test-other.js';
            const cjsPrefix = '\0commonjs-proxy:';
            if (id.startsWith(cjsPrefix)) {
              id = id.substr(cjsPrefix.length);
              return {id, external: true};
            }
          }
        },
      },
      rollupPluginCommonJS(),
    ],
    external(id, importer, resolved) {
      // Marking the code as external causes something not to resolve, so this binary exits early.
      console.info('marking', id, 'as external', `resolved=${resolved}`, 'internal?', id.startsWith('\0'));

      // If we always return true here, this method is called fewer times (the program crashes earlier).
      if (resolved) {
        return true;
      }
    },
  });

  console.info('About to `bundle.generate`...');
  const out = await bundle.generate({
    format: 'es',
    sourcemap: true,
  });

  for (const f of out.output) {
    console.debug('\n>>', f.fileName)
    console.info(f.code);
  }
}

repro().catch((err) => {
  console.warn(err);
  process.exit(1);
});
