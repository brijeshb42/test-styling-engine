import hashString from '@emotion/hash';

export const params = new URLSearchParams(document.location.search.slice(1));

const dynamicPart = ' &:disabled {color: gray;}';
export const cssString = `
  all: unset;
  box-sizing: border-box;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  user-select: none;
  vertical-align: top;
  background-clip: padding-box;
  text-align: center;
  font-style: normal;
  font-family: var(--button-typeface);
  font-weight: var(--button-weight);
  cursor: var(--cursor-button);
  --random: --placeholder;${params.get('d') === '1' ? dynamicPart : ''}`;

export function getCss(index = 0, repeat = 0) {
  const css = cssString.replaceAll('--placeholder', index + 'px');
  const hash = hashString(css);
  const result = [css];
  if (repeat) {
    for (let i = 0; i < repeat; i++) {
      result.push(css);
    }
  }
  return { result, hash };
}

export const NUM_OF_ITEMS = (() => {
  const count = params.get('count');
  if (typeof count === 'string' && count) {
    return parseInt(count, 10);
  }
  return 1000;
})();
