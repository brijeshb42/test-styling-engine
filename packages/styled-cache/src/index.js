'use client';
import * as React from 'react';

import { generateBaseCache } from './common';

const CacheContext = React.createContext(generateBaseCache());

export function useStyledCache() {
  return React.useContext(CacheContext);
}

export function StyledCacheProvider({ children }) {
  const cache = React.useRef({});

  const ctx = React.useMemo(() => generateBaseCache(cache.current), [cache]);

  return <CacheContext.Provider value={ctx}>{children}</CacheContext.Provider>;
}
