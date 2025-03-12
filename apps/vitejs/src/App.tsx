import * as React from 'react';
import { NUM_OF_ITEMS } from './common';
import { components as reactComponents } from './react';
import { components as emotionComponents } from './emotion';

const typeToRender =
  new URLSearchParams(location.search.slice(1)).get('type') ?? 'react';

function App() {
  const [renderButtons, setRenderButton] = React.useState(false);
  const [renderLater, setRenderLater] = React.useState(false);
  const children: React.JSX.Element[] = [];

  const handleClick = () => {
    setRenderButton(true);

    if (renderButtons) {
      setRenderLater(true);
    }
  };

  if (renderButtons) {
    for (let i = 0; i < NUM_OF_ITEMS; i++) {
      const Component =
        typeToRender === 'react' ? reactComponents[i] : emotionComponents[i];
      children.push(<Component key={i}>Button {i + 1}</Component>);
    }
  }

  React.useEffect(() => {
    if (!renderButtons) {
      return;
    }
    const styleStart =
      typeToRender === 'react'
        ? performance.getEntriesByName('Style_start')
        : performance.getEntriesByName('Emotion_start');
    const styleEnd =
      typeToRender === 'react'
        ? performance.getEntriesByName('Style_end')
        : performance.getEntriesByName('Emotion_end');
    if (styleEnd.length < styleStart.length) {
      console.log('Unmatching marks');
      return;
    }
    let sum = 0;
    for (let i = 0; i < NUM_OF_ITEMS; i++) {
      sum += styleEnd[i].startTime - styleStart[i].startTime;
    }
    console.log({
      avg: sum / NUM_OF_ITEMS,
    });
    performance.clearMarks();
  }, [renderButtons]);

  return (
    <div>
      <button onClick={handleClick}>
        Render Button
      </button>
      {renderButtons && children}
      {renderLater && (
        <style href="test" precedence='button-0'>
          {`.mui-Button-1 {
            background-color: red;
          }`}
        </style>
      )}
    </div>
  );
}

export default App;
