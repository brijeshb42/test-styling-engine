import { serialize, compile, middleware, stringify } from 'stylis';
import isDevelopment from '#is-development';
import {
  compat,
  removeLabel,
  createUnsafeSelectorsAlarm,
  incorrectImportAlarm,
} from './stylis-plugins';
import type { prefixer } from './prefixer';

const defaultStylisPlugins: (typeof prefixer)[] = [];

let getSourceMap: ((styles: string) => string | undefined) | undefined;
if (isDevelopment) {
  let sourceMapPattern =
    /\/\*#\ssourceMappingURL=data:application\/json;\S+\s+\*\//g;
  getSourceMap = (styles) => {
    let matches = styles.match(sourceMapPattern);
    if (!matches) return;
    return matches[matches.length - 1];
  };
}

const stylisPlugins = defaultStylisPlugins;

const omnipresentPlugins = [compat, removeLabel];

const finalizingPlugins = [stringify];
if (isDevelopment) {
  omnipresentPlugins.push(
    createUnsafeSelectorsAlarm({
      get compat() {
        return false;
      },
    }),
    incorrectImportAlarm
  );
}

const serializer = middleware(
  omnipresentPlugins.concat(stylisPlugins, finalizingPlugins)
);
const stylis = (styles: string) => serialize(compile(styles), serializer);

export function generateCss(selector: string, styles: string) {
  return stylis(selector ? `${selector}{${styles}}` : styles);
}
