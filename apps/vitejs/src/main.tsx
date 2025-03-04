import { createRoot } from 'react-dom/client';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';

import App from './App.tsx';

performance.clearMarks();

const params = new URLSearchParams(document.location.search.slice(1));

const cache = createCache({
  key: 'mui',
  speedy: params.get('speedy') === '1',
});

createRoot(document.getElementById('root')!).render(
  <CacheProvider value={cache}>
    <App />
  </CacheProvider>
);
