import { defineConfig } from 'tsup';
import config from '../../tsup.config';

export default defineConfig({
  ...config,
  entry: [
    'src/index.js',
    'src/index-server.js',
    'src/getValue.js',
    'src/getValueNextjs.js',
  ],
  external: ['@joy/styling-engine-context/getValue'],
});
