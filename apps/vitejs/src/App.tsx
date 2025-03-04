import * as React from 'react';
import styled, { StyledTags } from '@emotion/styled';
import hashString from '@emotion/hash';

const params = new URLSearchParams(document.location.search.slice(1));

const dynamicPart = ' &:disabled {color: gray;}';
const cssString = `
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

const r19Styles: React.JSX.Element[] = [];
const emotionComponents: ReturnType<StyledTags['button']>[] = [];

const NUM_OF_ITEMS = (() => {
  const count = params.get('count');
  if (typeof count === 'string' && count) {
    return parseInt(count, 10);
  }
  return 1000;
})();

for (let i = 0; i < NUM_OF_ITEMS; i++) {
  const modifiedCss = cssString.replace('--placeholder', Math.random() + 'px');
  const hash = hashString(modifiedCss);
  r19Styles.push(
    <style href={hash} precedence={`button-${i}`}>
      {`.mui-Button {${modifiedCss}}`}
    </style>
  );

  emotionComponents.push(styled.button(modifiedCss));
}

function React19Component({
  children,
  style,
}: {
  style?: React.JSX.Element;
  children?: React.ReactNode;
}) {
  performance.mark('Style_start');
  return (
    <button className="mui-Button">
      {style}
      {children}
    </button>
  );
}

function EmotionWrapper({
  Comp,
  children,
}: {
  Comp: React.FC<{ children?: React.ReactNode }>;
  children?: React.ReactNode;
}) {
  return <Comp>{children}</Comp>;
}

function TestComponent({ index }: { index: number }) {
  const r19Style = r19Styles[index];
  const EmotionComponent = emotionComponents[index];

  return (
    <>
      <React19Component style={r19Style}>Joy Button</React19Component>
      <EmotionWrapper Comp={EmotionComponent}>Emotion Button</EmotionWrapper>
    </>
  );
}

function App() {
  const [renderButton, setRenderButton] = React.useState(false);
  const children: React.JSX.Element[] = [];

  if (renderButton) {
    for (let i = 0; i < NUM_OF_ITEMS; i++) {
      children.push(<TestComponent key={i} index={i} />);
    }
  }

  React.useEffect(() => {
    if (!renderButton) {
      return;
    }
    const styleStart = performance.getEntriesByName('Style_start');
    const styleEnd = performance.getEntriesByName('Style_end');
    const emotionStart = performance.getEntriesByName('Emotion_start');
    const emotionEnd = performance.getEntriesByName('Emotion_end');
    if (
      styleEnd.length < styleStart.length ||
      emotionEnd.length < emotionStart.length
    ) {
      console.log('Unmatching marks');
      return;
    }
    let sumReact = 0,
      sumEmotion = 0;
    for (let i = 0; i < NUM_OF_ITEMS; i++) {
      sumReact += styleEnd[i].startTime - styleStart[i].startTime;
      sumEmotion += emotionEnd[i].startTime - emotionStart[i].startTime;
    }
    const react = sumReact / NUM_OF_ITEMS;
    const emotion = sumEmotion / NUM_OF_ITEMS;
    const change = ((react - emotion) / emotion) * 100;

    console.log({
      react,
      emotion,
      change: `${change} (${emotion < react ? 'emotion' : 'react'} is faster)`,
    });
    performance.clearMarks();
  }, [renderButton]);

  return (
    <div>
      <button onClick={() => setRenderButton(!renderButton)}>
        Render Button
      </button>
      {renderButton && children}
    </div>
  );
}

export default App;
