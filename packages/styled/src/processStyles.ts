import type { Interpolation, Theme } from '@emotion/react';
import { serializeStyles } from '@emotion/serialize';
import { generateCss as generateStylisCss } from '@brijbyte/styled-preprocessor-stylis';

type StaticStyle = {
  type: 'static';
  key: string;
  className: string;
  css: string;
};

type DynamicStyle = {
  type: 'dynamic';
};

type ProcessedStyle = StaticStyle | DynamicStyle;

function isArgsTaggedTemplateLiteral(args: any[]) {
  const result =
    args.length > 0 &&
    Array.isArray(args[0]) &&
    typeof args[0][0] === 'string' &&
    Object.prototype.hasOwnProperty.call(args[0], 'raw');

  if (!result) {
    return {
      result,
      hasDynamicStyles: false,
    };
  }

  const hasDynamicStyles = args.some((item) => typeof item === 'function');

  return {
    result,
    hasDynamicStyles: result && hasDynamicStyles,
  };
}

export function processStyles(
  styles: Array<TemplateStringsArray | Interpolation<Theme>>,
  prefix = 'css'
): ProcessedStyle[] {
  const { result: isTaggedTemplateLiteral, hasDynamicStyles } =
    isArgsTaggedTemplateLiteral(styles);

  const processedStyles: ProcessedStyle[] = [];

  if (isTaggedTemplateLiteral) {
    if (!hasDynamicStyles) {
      const serialized = serializeStyles(styles, undefined);
      const className = `${prefix}-${serialized.name}`;
      processedStyles.push({
        type: 'static',
        key: serialized.name,
        className,
        css: generateStylisCss(`.${className}`, serialized.styles),
      });
      return processedStyles;
    }
  }

  return processedStyles;
}
