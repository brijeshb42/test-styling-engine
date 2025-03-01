import { transformAsync } from '@babel/core';
import { format as prettierFormat } from 'prettier';

import stylingEnginePlugin from '../src';

async function transform(
  input: string,
  styleTagImportPath = 'styling-engine/Style'
) {
  const res = await transformAsync(input, {
    plugins: [
      [
        stylingEnginePlugin,
        {
          importPathEndsWith: 'styling-engine',
          breakpointsPath: 'styling-engine/config',
          styleTagImportPath,
        },
      ],
    ],
  });
  return res?.code;
}

async function transformAndFormat(code: string, styleTagImportPath?: string) {
  const result = await transform(code, styleTagImportPath);
  return prettierFormat(result as string, {
    singleQuote: true,
    trailingComma: 'es5',
    parser: 'babel',
  });
}

test('should transform @breakpoints', async () => {
  const result = await transformAndFormat(`import { css } from 'styling-engine';

  const res = css\`
    .mui-button {
      color: red;

      @breakpoints {
        &.size-1 {
          padding: var(--size-1);
        }
        &.size-2 {
          padding: var(--size-2);
        }
      }
    }
  \``);
  expect(result).toMatchInlineSnapshot(`
    "import { Style as _Style } from 'styling-engine/Style';
    import { breakpoints as _breakpoints } from 'styling-engine/config';
    const res = (
      <_Style href="8wm7yi" precedence="mui-components">
        {'.mui-button{color:red}' +
          Object.keys(_breakpoints).reduce(
            (acc, key) =>
              acc +
              \`@media \${_breakpoints[key]}{ .mui-button.\${key}\\\\\\:size-1{padding:var(--size-1)}.mui-button.\${key}\\\\\\:size-2{padding:var(--size-2)} }\`,
            '.mui-button.size-1{padding:var(--size-1)}.mui-button.size-2{padding:var(--size-2)}'
          ) +
          ''}
      </_Style>
    );
    "
  `);
});

test('should transform @breakpoints without the nested selector reference', async () => {
  const result = await transformAndFormat(`import { css } from 'styling-engine';

  const res = css\`
    .mui-button {
      color: red;
    }

    @breakpoints {
      .mui-Button.size-1 {
        padding: var(--size-1);
      }
      .mui-Button.size-2 {
        padding: var(--size-2);
      }
    }
  \``);
  expect(result).toMatchInlineSnapshot(`
    "import { Style as _Style } from 'styling-engine/Style';
    import { breakpoints as _breakpoints } from 'styling-engine/config';
    const res = (
      <_Style href="1j1ns12" precedence="mui-components">
        {'.mui-button{color:red}' +
          Object.keys(_breakpoints).reduce(
            (acc, key) =>
              acc +
              \`@media \${_breakpoints[key]}{ .mui-Button.\${key}\\\\\\:size-1{padding:var(--size-1)}.mui-Button.\${key}\\\\\\:size-2{padding:var(--size-2)} }\`,
            '.mui-Button.size-1{padding:var(--size-1)}.mui-Button.size-2{padding:var(--size-2)}'
          ) +
          ''}
      </_Style>
    );
    "
  `);
});

test('should transform multiple @breakpoints references', async () => {
  const result = await transformAndFormat(`import { css } from 'styling-engine';

  const res = css\`
    .mui-button {
      color: red;

      @breakpoints {
        &.size-1 {
          padding: var(--size-1);
        }
        &.size-2 {
          padding: var(--size-2);
        }
      }

      &:disabled {
        color: gray;
      }
      
      @breakpoints {
        &.variant-1 {
          color: green
        }
      }

      &:active {
        color: #08c;
      }
    }
  \``);
  expect(result).toMatchInlineSnapshot(`
    "import { Style as _Style } from 'styling-engine/Style';
    import { breakpoints as _breakpoints } from 'styling-engine/config';
    const res = (
      <_Style href="1qrqa6f" precedence="mui-components">
        {'.mui-button{color:red}' +
          Object.keys(_breakpoints).reduce(
            (acc, key) =>
              acc +
              \`@media \${_breakpoints[key]}{ .mui-button.\${key}\\\\\\:size-1{padding:var(--size-1)}.mui-button.\${key}\\\\\\:size-2{padding:var(--size-2)} }\`,
            '.mui-button.size-1{padding:var(--size-1)}.mui-button.size-2{padding:var(--size-2)}'
          ) +
          '.mui-button:disabled{color:gray}' +
          Object.keys(_breakpoints).reduce(
            (acc, key) =>
              acc +
              \`@media \${_breakpoints[key]}{ .mui-button.\${key}\\\\\\:variant-1{color:green} }\`,
            '.mui-button.variant-1{color:green}'
          ) +
          '.mui-button:active{color:#08c}'}
      </_Style>
    );
    "
  `);
});

test('should transform custom media query', async () => {
  const result = await transformAndFormat(`import { css } from 'styling-engine';

    const res = css\`
      .mui-button {
        color: red;

        @media (--xs) {
          color: blue;
        }
      }

      @breakpoints {
        .mui-Button.size-1 {
          padding: var(--size-1);
        }
        .mui-Button.size-2 {
          padding: var(--size-2);
        }
      }
    \``);
  expect(result).toMatchInlineSnapshot(`
    "import { Style as _Style } from 'styling-engine/Style';
    import { breakpoints as _breakpoints } from 'styling-engine/config';
    const res = (
      <_Style href="okdqv3" precedence="mui-components">
        {\`.mui-button{color:red}@media \${_breakpoints['xs']}{.mui-button{color:#00f}}\` +
          Object.keys(_breakpoints).reduce(
            (acc, key) =>
              acc +
              \`@media \${_breakpoints[key]}{ .mui-Button.\${key}\\\\\\:size-1{padding:var(--size-1)}.mui-Button.\${key}\\\\\\:size-2{padding:var(--size-2)} }\`,
            '.mui-Button.size-1{padding:var(--size-1)}.mui-Button.size-2{padding:var(--size-2)}'
          ) +
          ''}
      </_Style>
    );
    "
  `);
});

test('should transform custom media query at the start', async () => {
  const result = await transformAndFormat(`import { css } from 'styling-engine';

  const res = css\`@media (--xs) {
    .mui-Button {
      color: blue;
    }
  }\``);
  expect(result).toMatchInlineSnapshot(`
    "import { Style as _Style } from 'styling-engine/Style';
    import { breakpoints as _breakpoints } from 'styling-engine/config';
    const res = (
      <_Style
        href="153s0vy"
        precedence="mui-components"
      >{\`@media \${_breakpoints['xs']}{.mui-Button{color:#00f}}\`}</_Style>
    );
    "
  `);
});

test('should fallback to "style" element if import path for Style is not provided', async () => {
  const result = await transformAndFormat(
    `import { css } from 'styling-engine';

  const res = css\`@media (--xs) {
    .mui-Button {
      color: blue;
    }
  }\``,
    ''
  );
  expect(result).toMatchInlineSnapshot(`
    "import { breakpoints as _breakpoints } from 'styling-engine/config';
    const res = (
      <style
        href="153s0vy"
        precedence="mui-components"
      >{\`@media \${_breakpoints['xs']}{.mui-Button{color:#00f}}\`}</style>
    );
    "
  `);
});
