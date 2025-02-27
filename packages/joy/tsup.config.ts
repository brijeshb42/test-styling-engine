import fs from 'node:fs/promises';

import { defineConfig, type Options } from 'tsup';
import { transformAsync, loadOptions } from '@babel/core';

import config from '../../tsup.config';

const babelPlugin: Exclude<Options['esbuildPlugins'], undefined>[number] = {
  name: 'babel-transform',
  setup: (build) => {
    build.onLoad({ filter: /\.tsx?$/ }, async ({ path: filePath }) => {
      const content = await fs.readFile(filePath, 'utf-8');
      const opts = loadOptions({
        babelrc: false,
        plugins: [
          [
            '@babel/plugin-transform-typescript',
            {
              isTSX: true,
            },
          ],
          [
            '@babel/plugin-transform-react-jsx',
            {
              runtime: 'automatic',
            },
          ],
          [
            '@joy/styling-engine-babel-plugin',
            {
              importPathEndsWith: '@joy/styling-engine',
              breakpointsPath: '@joy/joy-ui/config',
              styleTagImportPath: '@joy/styling-engine/Style',
            },
          ],
        ],
      });
      if (!opts) {
        return null;
      }
      const result = await transformAsync(content, opts);
      return {
        contents: result?.code || content,
      };
    });
  },
};

export default defineConfig({
  ...config,
  entry: ['src/index.tsx', 'src/config.ts', 'src/base-config.ts'],
  esbuildPlugins: [babelPlugin],
  external: ['@joy/joy-ui/config'],
});
