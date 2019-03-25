const rollup = require('rollup');
const rollupPluginCommonJS = require('rollup-plugin-commonjs');


async function repro() {
  console.info('About to `rollup.rollup`...');
  const bundle = await rollup.rollup({
    input: ['code/test.js'],
    plugins: [
      rollupPluginCommonJS(),
    ],
    external(id, importer, resolved) {
      // Marking the code as external causes something not to resolve, so this binary exits early.
      console.info('marking', id, 'as external', `resolved=${resolved}`);

      // If we always return true here, this method is called fewer times (the program crashes earlier).
      if (resolved) {
        return true;
      }
    },
  });

  // NEVER GETS HERE
  console.info('About to `bundle.generate`...');
  const out = await bundle.generate({
    format: 'es',
    sourcemap: true,
  });
}

repro().catch((err) => {
  console.warn(err);
  process.exit(1);
});
