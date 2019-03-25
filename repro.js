const rollup = require('rollup');
const rollupPluginCommonJS = require('rollup-plugin-commonjs');


async function repro() {
  console.info('About to `rollup.rollup`...');
  const bundle = await rollup.rollup({
    input: ['test.js'],
    plugins: [
      rollupPluginCommonJS(),
    ],
    external(id, importer, resolved) {
      if (resolved) {
        console.debug('treat the neighbour as external, do not include in output:', id);
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
