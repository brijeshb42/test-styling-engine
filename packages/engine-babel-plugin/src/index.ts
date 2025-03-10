import * as path from 'node:path';
import type { NodePath, PluginObj } from '@babel/core';
import { addNamed } from '@babel/helper-module-imports';

import type { Core } from './types';
import { generateStyledNode, UserOptions } from './generateStyledNode';
import type { OutputType } from './generateCss';

export type StylingEnginePluginOptions = {
  importPathEndsWith?: string;
  breakpointsPath: string;
  styleTagImportPath: string;
  output?: OutputType;
  addCssImportToFile?: boolean;
};

export const PLUGIN_NAME = 'styling-engine-plugin';

export default function stylingEnginePlugin(
  babel: Core,
  options?: Partial<StylingEnginePluginOptions>
): PluginObj {
  const {
    importPathEndsWith = '@joy/styling-engine',
    output = 'runtime',
    addCssImportToFile = false,
  } = options ?? {};
  const { types: t } = babel;

  let importMap: Record<
    string,
    Record<string, ReturnType<Core['types']['identifier']>>
  > = {};
  const addNamedImport = (path: NodePath, name: string, source?: string) => {
    const importSource = source ?? options?.breakpointsPath ?? '';
    if (!importMap[importSource]) {
      importMap[importSource] = {};
    }
    if (!importMap[importSource][name]) {
      importMap[importSource][name] = addNamed(path, name, importSource, {
        importedType: 'es6',
      });
    }
    return importMap[importSource][name];
  };
  const addNamedStyleImport = (path: NodePath, name: string) => {
    const importSource = options?.styleTagImportPath ?? '';
    if (!importSource) {
      return null;
    }
    if (!importMap[importSource]) {
      importMap[importSource] = {};
    }
    if (!importMap[importSource][name]) {
      importMap[importSource][name] = addNamed(path, name, importSource, {
        importedType: 'es6',
      });
    }
    return importMap[importSource][name];
  };

  return {
    name: PLUGIN_NAME,
    pre() {
      importMap = {};
    },
    visitor: {
      TaggedTemplateExpression(node, state) {
        const tag = node.get('tag');
        if (!tag.isCallExpression() && !tag.isIdentifier()) {
          return;
        }
        const callId = tag.isCallExpression() ? tag.get('callee') : tag;

        if (!callId.isIdentifier()) {
          return;
        }

        const binding = callId.scope.getBinding(callId.node.name);
        if (!binding) {
          return;
        }
        const { path: importPath } = binding;
        if (!importPath.isImportSpecifier()) {
          return;
        }
        const imported = importPath.get('imported');
        if (!imported.isIdentifier({ name: 'css' })) {
          return;
        }
        const importDecl = importPath.findParent((p) =>
          p.isImportDeclaration()
        );
        if (!importDecl || !importDecl.isImportDeclaration()) {
          return;
        }
        const source = importDecl.get('source');
        if (
          !source.isStringLiteral() ||
          !source.node.value.endsWith(importPathEndsWith)
        ) {
          return;
        }
        const quasi = node.get('quasi');
        const options = tag.isCallExpression() ? tag.get('arguments')[0] : null;
        const evaledOpts =
          options && options.isObjectExpression() ? options.evaluate() : null;
        if (evaledOpts !== null && !evaledOpts.confident) {
          if (!options) {
            throw tag.buildCodeFrameError(
              'Please pass static values as options instead of referencing variables.'
            );
          }
          throw options.buildCodeFrameError(
            'Please pass static values as options instead of referencing variables.'
          );
        }
        const userOptions = (evaledOpts?.value as UserOptions | null) ?? null;
        const cssStr = quasi
          .get('quasis')
          .map((el) => el.node.value.cooked)
          .join('');
        const addNamedImportLocal = (name: string, source?: string) =>
          addNamedImport(node, name, source);
        const addNamedStyleImportLocal = (name: string) =>
          addNamedStyleImport(node, name);
        const result = generateStyledNode(
          {
            ...babel,
            addNamedImport: addNamedImportLocal,
            addNamedStyleImport: addNamedStyleImportLocal,
          },
          cssStr,
          userOptions,
          {
            filename: state.filename,
            location: node.node.loc,
            output,
          }
        );

        node.replaceWith(result.node);
        if (output === 'static') {
          const css =
            (this.file.metadata as Record<string, string[]>)[PLUGIN_NAME] ?? [];
          css.push(result.css);
          (this.file.metadata as Record<string, string[]>)[PLUGIN_NAME] = css;
        }
      },
      Program: {
        exit(node, state) {
          node.traverse({
            ImportDeclaration(decl) {
              const source = decl.get('source');

              if (
                source.isStringLiteral() &&
                (source.get('value') as { node: string }).node ===
                  importPathEndsWith
              ) {
                decl.remove();
              }
            },
          });

          if (addCssImportToFile && output === 'static') {
            const css = (state.file.metadata as Record<string, string[]>)[
              PLUGIN_NAME
            ];
            if (!css?.length) {
              return;
            }
            const file = state.file.opts.filename;
            const cssFileName = !file
              ? 'index.css'
              : `${path.basename(file, path.extname(file))}.css`;
            node.unshiftContainer(
              'body',
              t.importDeclaration([], t.stringLiteral(`./${cssFileName}`))
            );
          }
        },
      },
    },
  };
}
