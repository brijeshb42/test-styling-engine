import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ContextProvider } from '@joy/styling-engine-context';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ContextProvider value={{ nonce: 'temp' }}>
      <App />
    </ContextProvider>
  </StrictMode>
);
