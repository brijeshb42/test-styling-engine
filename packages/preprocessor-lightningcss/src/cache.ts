import { transform, Features } from 'lightningcss';
import isDevelopment from '#is-development';

export function generateCss(selector: string, styles: string) {
  const inputCss = Buffer.from(selector ? `${selector}{${styles}}` : styles);
  const result = transform({
    code: inputCss,
    filename: 'input.css',
    include: Features.Nesting | Features.CustomMediaQueries,
    minify: !isDevelopment,
  });
  return result.code.toString();
}
