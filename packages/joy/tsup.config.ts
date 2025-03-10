import fs from 'node:fs/promises';
import * as path from 'node:path';

import { defineConfig, type Options } from 'tsup';
import { transformAsync, loadOptions } from '@babel/core';

import config from '../../tsup.config';

const PLUGIN_NAME = 'styling-engine-plugin';

const babelPlugin: Exclude<Options['esbuildPlugins'], undefined>[number] = {
  name: 'babel-transform',
  setup: (build) => {
    const cssMap: Record<string, string> = {};
    const NAMESPACE = 'styling-engine';
    build.onLoad(
      { filter: /\.tsx?$/, namespace: 'file' },
      async ({ path: filePath }) => {
        const content = await fs.readFile(filePath, 'utf-8');
        const opts = loadOptions({
          babelrc: true,
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
                output: 'static',
                addCssImportToFile: true,
              },
            ],
          ],
        });
        if (!opts) {
          return null;
        }
        (opts as unknown as { filename: string }).filename = filePath;
        const result = await transformAsync(content, opts);
        const css = (
          result?.metadata as unknown as Record<string, string[] | undefined>
        )[PLUGIN_NAME];
        if (css?.length) {
          // Store the CSS content in our map using the module path
          cssMap[filePath] = css.join('\n');
        }
        return {
          contents: result?.code || content,
          pluginData: {
            [NAMESPACE]: filePath,
          },
        };
      }
    );

    build.onResolve({ filter: /\.css$/, namespace: 'file' }, (args) => {
      // Resolve the CSS file path relative to the importing file
      return {
        namespace: NAMESPACE,
        path: args.importer, // Use the importing file's path as our key
        sideEffects: true,
      };
    });

    build.onLoad({ filter: /.*/, namespace: NAMESPACE }, async (args) => {
      const css = cssMap[args.path] || '';
      if (!css) {
        return undefined;
      }

      return {
        contents: css,
        loader: 'css',
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
