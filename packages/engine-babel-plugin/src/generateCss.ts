import { transform, Features, Declaration } from 'lightningcss';
import { codeFrameColumns } from '@babel/code-frame';

export type Position = {
  line: number;
  column: number;
};

function generateRandomNumberBetween(min: number = 1, max: number = 1000) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const UTILITY_RESPONSIVE_CLASS_NAMES: Record<string, string> = {
  // Utilities
  'align-content': 'ac',
  'align-items': 'ai',
  'align-self': 'as',
  bottom: 'b',
  'column-gap': 'cg',
  display: 'd',
  'flex-basis': 'fb',
  'flex-direction': 'fd',
  'flex-grow': 'fg',
  'flex-shrink': 'fs',
  'flex-wrap': 'fw',
  gap: 'g',
  'grid-column-end': 'gce',
  'grid-column-start': 'gcs',
  'grid-row-end': 'gre',
  'grid-row-start': 'grs',
  'grid-template-columns': 'gtc',
  'grid-template-rows': 'gtr',
  height: 'h',
  inset: 'i',
  'justify-content': 'jc',
  left: 'l',
  'margin-bottom': 'mb',
  'margin-left': 'ml',
  'margin-right': 'mr',
  'margin-top': 'mt',
  'margin-x': 'mx',
  'margin-y': 'my',
  margin: 'm',
  'max-height': 'max-h',
  'max-width': 'max-w',
  'min-height': 'min-h',
  'min-width': 'min-w',
  'overflow-x': 'ox',
  'overflow-y': 'oy',
  overflow: 'o',
  'padding-bottom': 'pb',
  'padding-left': 'pl',
  'padding-right': 'pr',
  'padding-top': 'pt',
  'padding-x': 'px',
  'padding-y': 'py',
  padding: 'p',
  position: 'pos',
  right: 'r',
  'row-gap': 'rg',
  'text-align': 'ta',
  'text-wrap': 'tw',
  top: 't',
  width: 'w',
};

const COMPONENT_PROPS_RESPONSIVE_CLASS_NAMES: Record<string, string> = {
  // Component props
  size: 'size',
};

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
  } = options ?? {};
  const result = transform({
    minify: true,
    filename,
    code: Buffer.from(cssStr),
    include: Features.Nesting,
    customAtRules: {
      breakpoints: {
        body: 'style-block',
      },
    },
    visitor: {
      Rule: {
        media(rule) {
          if (supportsRuntime) {
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
          }

          return rule;
        },
        custom: {
          breakpoints(rule) {
            const result = [...rule.body.value];

            if (!supportsRuntime) {
              return result;
            }
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
    },
  });
  return result.code.toString();
}
