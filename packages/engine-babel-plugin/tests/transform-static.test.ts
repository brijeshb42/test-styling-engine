import { transformAsync } from '@babel/core';
import { format as prettierFormat } from 'prettier';

import stylingEnginePlugin, { PLUGIN_NAME } from '../src';

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
          output: 'static',
          addCssImportToFile: true,
        },
      ],
    ],
  });
  return {
    code: res?.code,
    css: (
      ((res?.metadata as unknown as Record<string, string[] | undefined>)?.[
        PLUGIN_NAME
      ] as string[]) ?? []
    ).join('\n'),
  };
}

async function transformAndFormat(code: string, styleTagImportPath?: string) {
  const { code: result, css: cssStr } = await transform(
    code,
    styleTagImportPath
  );
  const js = await prettierFormat(result as string, {
    singleQuote: true,
    trailingComma: 'es5',
    parser: 'babel',
  });
  const css = await prettierFormat(cssStr as string, {
    singleQuote: true,
    trailingComma: 'es5',
    parser: 'css',
  });
  return { code: js, css };
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
  expect(result.code).toMatchInlineSnapshot(`
    "import './index.css';
    const res = null;
    "
  `);
  expect(result.css).toMatchInlineSnapshot(`
    ".mui-button {
      color: red;
    }
    .mui-button.size-1 {
      padding: var(--size-1);
    }
    .mui-button.size-2 {
      padding: var(--size-2);
    }
    @media (width>=520px) {
      .mui-button.xs.size-1 {
        padding: var(--size-1);
      }
      .mui-button.xs.size-2 {
        padding: var(--size-2);
      }
    }
    @media (width>=768px) {
      .mui-button.sm.size-1 {
        padding: var(--size-1);
      }
      .mui-button.sm.size-2 {
        padding: var(--size-2);
      }
    }
    @media (width>=1024px) {
      .mui-button.md.size-1 {
        padding: var(--size-1);
      }
      .mui-button.md.size-2 {
        padding: var(--size-2);
      }
    }
    @media (width>=1280px) {
      .mui-button.lg.size-1 {
        padding: var(--size-1);
      }
      .mui-button.lg.size-2 {
        padding: var(--size-2);
      }
    }
    @media (width>=1640px) {
      .mui-button.xl.size-1 {
        padding: var(--size-1);
      }
      .mui-button.xl.size-2 {
        padding: var(--size-2);
      }
    }
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
  expect(result.code).toMatchInlineSnapshot(`
    "import './index.css';
    const res = null;
    "
  `);
  expect(result.css).toMatchInlineSnapshot(`
    ".mui-button {
      color: red;
    }
    .mui-Button.size-1 {
      padding: var(--size-1);
    }
    .mui-Button.size-2 {
      padding: var(--size-2);
    }
    @media (width>=520px) {
      .mui-Button.xs.size-1 {
        padding: var(--size-1);
      }
      .mui-Button.xs.size-2 {
        padding: var(--size-2);
      }
    }
    @media (width>=768px) {
      .mui-Button.sm.size-1 {
        padding: var(--size-1);
      }
      .mui-Button.sm.size-2 {
        padding: var(--size-2);
      }
    }
    @media (width>=1024px) {
      .mui-Button.md.size-1 {
        padding: var(--size-1);
      }
      .mui-Button.md.size-2 {
        padding: var(--size-2);
      }
    }
    @media (width>=1280px) {
      .mui-Button.lg.size-1 {
        padding: var(--size-1);
      }
      .mui-Button.lg.size-2 {
        padding: var(--size-2);
      }
    }
    @media (width>=1640px) {
      .mui-Button.xl.size-1 {
        padding: var(--size-1);
      }
      .mui-Button.xl.size-2 {
        padding: var(--size-2);
      }
    }
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
  expect(result.code).toMatchInlineSnapshot(`
    "import './index.css';
    const res = null;
    "
  `);
  expect(result.css).toMatchInlineSnapshot(`
    ".mui-button {
      color: red;
    }
    .mui-button.size-1 {
      padding: var(--size-1);
    }
    .mui-button.size-2 {
      padding: var(--size-2);
    }
    @media (width>=520px) {
      .mui-button.xs.size-1 {
        padding: var(--size-1);
      }
      .mui-button.xs.size-2 {
        padding: var(--size-2);
      }
    }
    @media (width>=768px) {
      .mui-button.sm.size-1 {
        padding: var(--size-1);
      }
      .mui-button.sm.size-2 {
        padding: var(--size-2);
      }
    }
    @media (width>=1024px) {
      .mui-button.md.size-1 {
        padding: var(--size-1);
      }
      .mui-button.md.size-2 {
        padding: var(--size-2);
      }
    }
    @media (width>=1280px) {
      .mui-button.lg.size-1 {
        padding: var(--size-1);
      }
      .mui-button.lg.size-2 {
        padding: var(--size-2);
      }
    }
    @media (width>=1640px) {
      .mui-button.xl.size-1 {
        padding: var(--size-1);
      }
      .mui-button.xl.size-2 {
        padding: var(--size-2);
      }
    }
    .mui-button:disabled {
      color: gray;
    }
    .mui-button.variant-1 {
      color: green;
    }
    @media (width>=520px) {
      .mui-button.xs.variant-1 {
        color: green;
      }
    }
    @media (width>=768px) {
      .mui-button.sm.variant-1 {
        color: green;
      }
    }
    @media (width>=1024px) {
      .mui-button.md.variant-1 {
        color: green;
      }
    }
    @media (width>=1280px) {
      .mui-button.lg.variant-1 {
        color: green;
      }
    }
    @media (width>=1640px) {
      .mui-button.xl.variant-1 {
        color: green;
      }
    }
    .mui-button:active {
      color: #08c;
    }
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
  expect(result.code).toMatchInlineSnapshot(`
    "import './index.css';
    const res = null;
    "
  `);
  expect(result.css).toMatchInlineSnapshot(`
    ".mui-button {
      color: red;
    }
    @media (width>=520px) {
      .mui-button {
        color: #00f;
      }
    }
    .mui-Button.size-1 {
      padding: var(--size-1);
    }
    .mui-Button.size-2 {
      padding: var(--size-2);
    }
    @media (width>=520px) {
      .mui-Button.xs.size-1 {
        padding: var(--size-1);
      }
      .mui-Button.xs.size-2 {
        padding: var(--size-2);
      }
    }
    @media (width>=768px) {
      .mui-Button.sm.size-1 {
        padding: var(--size-1);
      }
      .mui-Button.sm.size-2 {
        padding: var(--size-2);
      }
    }
    @media (width>=1024px) {
      .mui-Button.md.size-1 {
        padding: var(--size-1);
      }
      .mui-Button.md.size-2 {
        padding: var(--size-2);
      }
    }
    @media (width>=1280px) {
      .mui-Button.lg.size-1 {
        padding: var(--size-1);
      }
      .mui-Button.lg.size-2 {
        padding: var(--size-2);
      }
    }
    @media (width>=1640px) {
      .mui-Button.xl.size-1 {
        padding: var(--size-1);
      }
      .mui-Button.xl.size-2 {
        padding: var(--size-2);
      }
    }
    "
  `);
});

test('transform utility classes correctly', async () => {
  const result = await transformAndFormat(
    `import { css } from 'styling-engine';

  const res = css\`@breakpoints {
  .mui-ac-center {
    align-content: center;
  }
  .mui-ac-end {
    align-content: end;
  }
  .mui-ac-normal {
    align-content: normal;
  }
  .mui-ac-start {
    align-content: start;
  }
  .mui-ac-space-around {
    align-content: space-around;
  }
  .mui-ac-space-between {
    align-content: space-between;
  }
  .mui-ac-space-evenly {
    align-content: space-evenly;
  }
  .mui-ac-stretch {
    align-content: stretch;
  }
}\``,
    ''
  );
  expect(result.code).toMatchInlineSnapshot(`
    "import './index.css';
    const res = null;
    "
  `);
  expect(result.css).toMatchInlineSnapshot(`
    ".mui-ac-center {
      align-content: center;
    }
    .mui-ac-end {
      align-content: end;
    }
    .mui-ac-normal {
      align-content: normal;
    }
    .mui-ac-start {
      align-content: start;
    }
    .mui-ac-space-around {
      align-content: space-around;
    }
    .mui-ac-space-between {
      align-content: space-between;
    }
    .mui-ac-space-evenly {
      align-content: space-evenly;
    }
    .mui-ac-stretch {
      align-content: stretch;
    }
    @media (width>=520px) {
      .xs.mui-ac-center {
        align-content: center;
      }
      .xs.mui-ac-end {
        align-content: end;
      }
      .xs.mui-ac-normal {
        align-content: normal;
      }
      .xs.mui-ac-start {
        align-content: start;
      }
      .xs.mui-ac-space-around {
        align-content: space-around;
      }
      .xs.mui-ac-space-between {
        align-content: space-between;
      }
      .xs.mui-ac-space-evenly {
        align-content: space-evenly;
      }
      .xs.mui-ac-stretch {
        align-content: stretch;
      }
    }
    @media (width>=768px) {
      .sm.mui-ac-center {
        align-content: center;
      }
      .sm.mui-ac-end {
        align-content: end;
      }
      .sm.mui-ac-normal {
        align-content: normal;
      }
      .sm.mui-ac-start {
        align-content: start;
      }
      .sm.mui-ac-space-around {
        align-content: space-around;
      }
      .sm.mui-ac-space-between {
        align-content: space-between;
      }
      .sm.mui-ac-space-evenly {
        align-content: space-evenly;
      }
      .sm.mui-ac-stretch {
        align-content: stretch;
      }
    }
    @media (width>=1024px) {
      .md.mui-ac-center {
        align-content: center;
      }
      .md.mui-ac-end {
        align-content: end;
      }
      .md.mui-ac-normal {
        align-content: normal;
      }
      .md.mui-ac-start {
        align-content: start;
      }
      .md.mui-ac-space-around {
        align-content: space-around;
      }
      .md.mui-ac-space-between {
        align-content: space-between;
      }
      .md.mui-ac-space-evenly {
        align-content: space-evenly;
      }
      .md.mui-ac-stretch {
        align-content: stretch;
      }
    }
    @media (width>=1280px) {
      .lg.mui-ac-center {
        align-content: center;
      }
      .lg.mui-ac-end {
        align-content: end;
      }
      .lg.mui-ac-normal {
        align-content: normal;
      }
      .lg.mui-ac-start {
        align-content: start;
      }
      .lg.mui-ac-space-around {
        align-content: space-around;
      }
      .lg.mui-ac-space-between {
        align-content: space-between;
      }
      .lg.mui-ac-space-evenly {
        align-content: space-evenly;
      }
      .lg.mui-ac-stretch {
        align-content: stretch;
      }
    }
    @media (width>=1640px) {
      .xl.mui-ac-center {
        align-content: center;
      }
      .xl.mui-ac-end {
        align-content: end;
      }
      .xl.mui-ac-normal {
        align-content: normal;
      }
      .xl.mui-ac-start {
        align-content: start;
      }
      .xl.mui-ac-space-around {
        align-content: space-around;
      }
      .xl.mui-ac-space-between {
        align-content: space-between;
      }
      .xl.mui-ac-space-evenly {
        align-content: space-evenly;
      }
      .xl.mui-ac-stretch {
        align-content: stretch;
      }
    }
    "
  `);
});
