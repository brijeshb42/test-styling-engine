import { transformAsync } from '@babel/core';
import { format as prettierFormat } from 'prettier';

import stylingEnginePlugin from '../src';

async function transform(input: string) {
  const res = await transformAsync(input, {
    plugins: [
      [
        stylingEnginePlugin,
        {
          importPathEndsWith: 'styling-engine',
          breakpointsPath: 'styling-engine/config',
          styleTagImportPath: 'styling-engine/Style',
        },
      ],
    ],
  });
  return res?.code;
}

test.each([
  {
    message: 'should transform @breakpoints 1',
    input: `import { css } from 'styling-engine';

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
  \``,
  },
  {
    message: 'should transform @breakpoints 2',
    input: `import { css } from 'styling-engine';

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
  \``,
  },
  {
    message: 'should transform multiple @breakpoints',
    input: `import { css } from 'styling-engine';

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
  \``,
  },
  {
    message: 'should transform custom media query 1',
    input: `import { css } from 'styling-engine';

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
    \``,
  },
  {
    message: 'should transform custom media query at the start',
    input: `import { css } from 'styling-engine';

  const res = css\`@media (--xs) {
    .mui-Button {
      color: blue;
    }
  }\``,
  },
])('$message', async ({ input }) => {
  const result = await transform(input);
  expect(
    await prettierFormat(result as string, {
      singleQuote: true,
      trailingComma: 'es5',
      parser: 'babel',
    })
  ).toMatchSnapshot();
});
