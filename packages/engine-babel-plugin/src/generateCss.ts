import { transform, Features, Declaration } from 'lightningcss';

function generateRandomNumberBetween(min: number = 1, max: number = 1000) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * Transforms the given CSS string to browser understanable CSS.
 * Handles `@breakpoints` custom at-rule as well as custom media queries like `@media (--xs)` etc.
 */
export function generateCss(cssStr: string, filename: string = '') {
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
                selector.push({
                  type: 'class',
                  name: '__breakpoint_placeholder__',
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
                      name: `__separator-start-0${generateRandomNumberBetween()}`,
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
                      name: `__separator-end-${generateRandomNumberBetween()}`,
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
