type CssResult = React.JSX.Element;

type CssOptions = {
  href?: string;
  precedence?: string;
};

type CoreCssFunction = (
  strs: TemplateStringsArray,
  ...expressions: never[]
) => CssResult;

const DEFAULT_PRECEDENCE = 'components';

function getStyle(
  options: CssOptions | null,
  strs: TemplateStringsArray,
  ...values: never[]
) {
  const { href, precedence = DEFAULT_PRECEDENCE } = options ?? {};
  const cssString = strs.reduce(
    (result, str, i) => result + str + (values[i] ?? ''),
    ''
  );
  // console.time("CSS");
  const cssStr = cssString; // processCss(cssString);
  // console.timeEnd("CSS");
  return (
    <style href={href} precedence={precedence}>
      {cssStr}
    </style>
  );
}

export function css(
  strings: TemplateStringsArray,
  ...values: never[]
): CssResult;
export function css(options: CssOptions, ...rest: never[]): CoreCssFunction;
export function css(
  optionsOrStrs: TemplateStringsArray | CssOptions,
  ...values: never[]
): CoreCssFunction | CssResult {
  // Case 1: Called as css``
  if (Array.isArray(optionsOrStrs)) {
    return getStyle(null, optionsOrStrs as TemplateStringsArray, ...values);
  }
  // case 2: Called as css({})``
  return (strings: TemplateStringsArray, ...interpolatedValues: never[]) => {
    return getStyle(
      optionsOrStrs as CssOptions,
      strings as TemplateStringsArray,
      ...interpolatedValues
    );
  };
}
