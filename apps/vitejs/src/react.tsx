import { getCss, NUM_OF_ITEMS, params } from './common';

const r19Components: React.FC[] = [];

const styleRepeatCount = params.get('styleCount');
let repeat: number;
if (typeof styleRepeatCount === 'string') {
  repeat = parseInt(styleRepeatCount, 10);
} else {
  repeat = 0;
}
for (let i = 0; i < NUM_OF_ITEMS; i++) {
  const { result, hash } = getCss(i, repeat);
  const cssStr = result.map((res) => `.mui-Button-${i} {${res}}`).join('');
  const style = (
    <style href={hash} precedence={`button-${i}`}>
      {cssStr}
    </style>
  );
  function Component({ children }: { children?: React.ReactNode }) {
    performance.mark('Style_start');
    return (
      <button className={`mui-Button-${i}`}>
        {style}
        {children}
      </button>
    );
  }
  r19Components.push(Component);
}

export const components = r19Components;
