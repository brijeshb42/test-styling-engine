import {
  transform,
  Features,
  Visitor,
  MediaQuery,
  Declaration,
  SelectorList,
} from 'lightningcss';
import { cloneDeep } from 'lodash';
import { codeFrameColumns } from '@babel/code-frame';
import {
  COMPONENT_PROPS_RESPONSIVE_CLASS_NAMES,
  UTILITY_RESPONSIVE_CLASS_NAMES,
  BREAKPOINTS,
} from './defaultConfig';

export type Position = {
  line: number;
  column: number;
};

export type OutputType = 'runtime' | 'static';

function generateRandomNumberBetween(min: number = 1, max: number = 1000) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export const PLACEHOLDERS = {
  SEPARATOR_START: '#__separator-start',
  SEPARATOR_END: '#__separator-end',
  BREAKPOINT_PLACEHOLDER: '__breakpoint_placeholder__',
};

type GenerateCssOptions = {
  supportsRuntime?: boolean;
  prefix?: string;
  utilityClasses?: Record<string, string>;
  responsiveClasses?: Record<string, string>;
  breakpoints?: Record<string, string>;
  location?: {
    start: Position;
    end: Position;
  } | null;
};

function generateError(
  snippet: string,
  message: string,
  loc: { line: number; column: number }
) {
  return codeFrameColumns(
    snippet,
    {
      start: {
        line: loc.line + 1,
        column: loc.column + 1,
      },
    },
    {
      highlightCode: true,
      linesAbove: 2,
      linesBelow: 2,
      message,
    }
  );
}

function runtimeVisitor({
  css: cssStr,
  prefix,
  utilityClasses,
  responsiveClasses,
}: {
  css: string;
  prefix: string;
  utilityClasses: Record<string, string>;
  responsiveClasses: Record<string, string>;
  startLine?: number;
}): Visitor<{
  breakpoints: {
    body: 'style-block';
  };
}> {
  return {
    Rule: {
      media(rule) {
        const { value } = rule;
        // handles @media (--xs) {}
        value.query.mediaQueries = value.query.mediaQueries.map((q) => {
          if (
            q.condition?.type === 'feature' &&
            q.condition.value.type === 'boolean' &&
            q.condition.value.name.startsWith('--')
          ) {
            q.condition.value.name = `--__breakpoint_query_placeholder__${q.condition.value.name.substring(2)}`;
          }
          return q;
        });
        // handles @media (--xs) and (--lg) {}
        value.query.mediaQueries = value.query.mediaQueries.map((q) => {
          if (q.condition?.type === 'operation') {
            q.condition.conditions = q.condition.conditions.map((c) => {
              if (
                c.type === 'feature' &&
                c.value.type === 'boolean' &&
                c.value.name.startsWith('--')
              ) {
                c.value.name = `--__breakpoint_query_placeholder__${c.value.name.substring(2)}`;
              }
              return c;
            });
          }
          return q;
        });
        return rule;
      },
      custom: {
        breakpoints(rule) {
          const result = [...rule.body.value];

          result.forEach((style) => {
            if (style.type !== 'style') {
              return;
            }
            style.value.selectors.forEach((selector) => {
              /** Check for responsive utility classes */
              if (selector.length === 1) {
                const classNameRegexp = new RegExp(
                  `^(-?(${prefix}-)?(?:${Object.values(utilityClasses).join('|')})(?:-[a-z0-9]+)*(?![-a-z0-9]))`,
                  'g'
                );
                if (selector[0].type !== 'class') {
                  throw new Error(
                    generateError(
                      cssStr,
                      `Only class selector is supported in @breakpoints. Found "${selector[0].type}" selector.`,
                      style.value.loc
                    )
                  );
                }
                if (classNameRegexp.test(selector[0].name)) {
                  selector[0].name = `${PLACEHOLDERS.BREAKPOINT_PLACEHOLDER}:${selector[0].name}`;
                }
              }
              if (selector.length > 2) {
                throw new Error(
                  generateError(
                    cssStr,
                    `Found more than one variant selector. "@breakpoints" does not support compound props yet.`,
                    style.value.loc
                  )
                );
              }
              selector.forEach((sel, index) => {
                if (index === 0) {
                  return;
                }
                if (sel.type === 'class') {
                  const classNameRegexp = new RegExp(
                    `(-?(?:${Object.values(responsiveClasses).join(
                      '|'
                    )})(?:-[a-z0-9]+)*(?![-a-z0-9]))`,
                    'g'
                  );
                  if (classNameRegexp.test(sel.name)) {
                    sel.name = `${PLACEHOLDERS.BREAKPOINT_PLACEHOLDER}\\:${sel.name}`;
                  }
                }
              });
            });
          });
          const dummyDeclarations: Declaration[] = [
            {
              property: 'height',
              value: {
                type: 'length-percentage',
                value: {
                  type: 'dimension',
                  value: {
                    unit: 'px',
                    value: generateRandomNumberBetween(),
                  },
                },
              },
            },
          ];
          result.unshift({
            type: 'style',
            value: {
              rules: [],
              loc: rule.loc,
              selectors: [
                [
                  {
                    type: 'id',
                    name: `${PLACEHOLDERS.SEPARATOR_START.slice(1)}-0${generateRandomNumberBetween()}`,
                  },
                ],
              ],
              declarations: {
                importantDeclarations: [],
                declarations: dummyDeclarations,
              },
            },
          });
          result.push({
            type: 'style',
            value: {
              rules: [],
              loc: rule.loc,
              selectors: [
                [
                  {
                    type: 'id',
                    name: `${PLACEHOLDERS.SEPARATOR_END.slice(1)}-${generateRandomNumberBetween()}`,
                  },
                ],
              ],
              declarations: {
                importantDeclarations: [],
                declarations: dummyDeclarations,
              },
            },
          });

          return result;
        },
      },
    },
  };
}

function staticVisitor({
  css: cssStr,
  prefix,
  utilityClasses,
  responsiveClasses,
  breakpoints,
}: {
  css: string;
  prefix: string;
  breakpoints: Record<string, string>;
  utilityClasses: Record<string, string>;
  responsiveClasses: Record<string, string>;
  startLine?: number;
}): Visitor<{
  breakpoints: {
    body: 'style-block';
  };
}> {
  const mediaRules: Record<string, MediaQuery[]> = {};
  return {
    Rule: {
      'custom-media'(rule) {
        const ruleName = rule.value.name.slice(2);
        if (breakpoints[ruleName]) {
          mediaRules[rule.value.name.slice(2)] = rule.value.query.mediaQueries;
        }
        return rule;
      },
      custom: {
        breakpoints(rule) {
          const result = [...rule.body.value];
          const resultClone = cloneDeep(result);

          Object.entries(mediaRules).forEach(
            ([breakpointName, mediaQueries]) => {
              const ruleClone = cloneDeep(rule.body.value);
              ruleClone.forEach((style) => {
                if (style.type !== 'style') {
                  return;
                }
                const utilClassNameRegexp = new RegExp(
                  `^(-?(${prefix}-)?(?:${Object.values(utilityClasses).join('|')})(?:-[a-z0-9]+)*(?![-a-z0-9]))`,
                  'g'
                );
                const responsiveClassNameRegexp = new RegExp(
                  `(-?(?:${Object.values(responsiveClasses).join(
                    '|'
                  )})(?:-[a-z0-9]+)*(?![-a-z0-9]))`,
                  'g'
                );
                const selectors = style.value.selectors;
                const modifiedSelectors: SelectorList = [];
                selectors.forEach((selector) => {
                  if (selector.length === 1) {
                    const utilClassNameRegexp = new RegExp(
                      `^(-?(${prefix}-)?(?:${Object.values(utilityClasses).join('|')})(?:-[a-z0-9]+)*(?![-a-z0-9]))`,
                      'g'
                    );
                    if (selector[0].type !== 'class') {
                      throw new Error(
                        generateError(
                          cssStr,
                          `Only class selector is supported in @breakpoints. Found "${selector[0].type}" selector.`,
                          style.value.loc
                        )
                      );
                    }
                    if (utilClassNameRegexp.test(selector[0].name)) {
                      modifiedSelectors.push([
                        {
                          type: 'class',
                          name: breakpointName,
                        },
                        selector[0],
                      ]);
                    }
                  }
                  if (selector.length > 2) {
                    throw new Error(
                      generateError(
                        cssStr,
                        `Found more than one variant selector. "@breakpoints" does not support compound props yet.`,
                        style.value.loc
                      )
                    );
                  }

                  if (
                    selector.find((sel) => {
                      if (sel.type === 'class') {
                        const classNameRegexp = new RegExp(
                          `(-?(?:${Object.values(responsiveClasses).join(
                            '|'
                          )})(?:-[a-z0-9]+)*(?![-a-z0-9]))`,
                          'g'
                        );
                        if (classNameRegexp.test(sel.name)) {
                          return true;
                        }
                      }
                      return false;
                    })
                  ) {
                    modifiedSelectors.push([
                      ...selector.slice(0, selector.length - 1),
                      {
                        type: 'class',
                        name: breakpointName,
                      },
                      selector[selector.length - 1],
                    ]);
                  }
                });
                style.value.selectors = modifiedSelectors;
              });
              result.push({
                type: 'media',
                value: {
                  loc: rule.loc,
                  query: {
                    mediaQueries: mediaQueries,
                  },
                  rules: ruleClone,
                },
              });
            }
          );
          return result;
        },
      },
    },
  };
}

function generateCustomMediaCss(breakpoints: Record<string, string>) {
  return Object.entries(breakpoints)
    .map(([name, query]) => `@custom-media --${name} ${query};`)
    .join('\n');
}

/**
 * Transforms the given CSS string to browser understanable CSS.
 * Handles `@breakpoints` custom at-rule as well as custom media queries like `@media (--xs)` etc.
 *
 * @param cssStr The css string to be transformed.
 * @param filename The filename to be used in sourcemap if enabled.
 * @param supportsRuntime If false, then the custom transformations won't be applied.
 *
 * For the input -
 *
 * @example
 *
 * ```css
.mui-Button {
  color: red;
  @breakpoints {
    &.size-1 {
      padding: var(--size-1);
    }
  }

  @media (--xs) {
    &:disabled {
      color: grey;
    }
  }
}
 * ```
 *
 * will output
 *
 * ```css
 *
 *  .mui-Button {
      color: red;
    }
    #__separator-start-0745 {
      height: 17px;
    }
    .mui-Button.size-1.__breakpoint_placeholder__ {
      padding: var(--size-1);
    }
    #__separator-end-989 {
      height: 17px;
    }
    @media (--__breakpoint_query_placeholder__xs) {
      .mui-Button:disabled {
        color: gray;
      }
    }```
 * Then through string manipulation, a new AST is generated that replaces the `#__separator-start`. `#__separator-end` and
    `__breakpoint_query_placeholder__` values with runtime values. 
 */
export function generateCss(
  cssStr: string,
  filename: string = '',
  options?: GenerateCssOptions
) {
  const {
    supportsRuntime = true,
    prefix = 'mui',
    utilityClasses = UTILITY_RESPONSIVE_CLASS_NAMES,
    responsiveClasses = COMPONENT_PROPS_RESPONSIVE_CLASS_NAMES,
    location,
    breakpoints = BREAKPOINTS,
  } = options ?? {};
  const css = Buffer.from(
    `${supportsRuntime ? '' : generateCustomMediaCss(breakpoints)}\n${cssStr}`
  );

  const result = transform({
    minify: true,
    filename,
    code: css,
    include: Features.Nesting | Features.CustomMediaQueries,
    customAtRules: {
      breakpoints: {
        body: 'style-block',
      },
    },
    drafts: {
      customMedia: !supportsRuntime,
    },
    visitor: supportsRuntime
      ? runtimeVisitor({
          css: cssStr,
          prefix,
          utilityClasses,
          responsiveClasses,
          startLine: location?.start.line ?? 0,
        })
      : staticVisitor({
          css: cssStr,
          prefix,
          utilityClasses,
          responsiveClasses,
          breakpoints,
          startLine: location?.start.line ?? 0,
        }),
  });
  return result.code.toString();
}
