import * as React from 'react';
import styled from '@emotion/styled';

const EmotionButton = styled('button')({
  color: 'red',
});

const btnCss1 = (
  <style href="btn1" precedence="components">
    {'.mui-Button {color:red}'}
  </style>
);

const ReactButton = function () {
  performance.mark('style_start');
  return (
    <button>
      {btnCss1}
      {'Joy Button'}
    </button>
  );
};

function App() {
  const [renderButton, setRenderButton] = React.useState(false);
  React.useEffect(() => {
    if (!renderButton) {
      return;
    }
    const style = performance.measure('style', 'style_start', 'Style_end');
    const emotion = performance.measure(
      'style',
      'Emotion_start',
      'Emotion_end'
    );
    performance.clearMarks();

    console.log({ style: style.duration, emotion: emotion.duration });
  }, [renderButton]);
  return (
    <div>
      <button onClick={() => setRenderButton(true)}>Render Button</button>
      {renderButton && (
        <>
          <ReactButton />
          <EmotionButton>Emotion Button</EmotionButton>
        </>
      )}
    </div>
  );
}

export default App;
