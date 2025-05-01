'use client';
import * as React from 'react';

const CacheContext = React.createContext(null);

export function useCache() {
  return React.useContext(CacheContext);
}

export function CacheProvider({ children }) {
  const cache = React.useRef({});

  const ctx = React.useMemo(
    () => ({
      isStyleRendered: (key) => {
        return cache.current[key] === 1;
      },
      addStyleToCache: (key) => {
        cache.current[key] = 1;
      },
    }),
    [cache]
  );

  return <CacheContext.Provider value={ctx}>{children}</CacheContext.Provider>;
}
