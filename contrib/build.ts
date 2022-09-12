/** eslint-env node */
import esbuild from 'esbuild';
import path from 'path';

esbuild
  .build({
    entryPoints: [path.join(__dirname, '..', 'src', 'index.ts')],
    outfile: path.join(__dirname, '..', 'dist', 'index.js'),
    platform: 'node',
    bundle: true,
    minify: process.env.node_env === 'production',
    external: [],
    sourcemap: true,
    tsconfig: path.join(__dirname, '..', 'tsconfig.json'),
  })
  .catch(() => {
    process.exit(1);
  });
