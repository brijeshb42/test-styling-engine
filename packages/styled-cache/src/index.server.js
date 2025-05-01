import * as React from 'react';

export const useCache = React.cache(() => {
  const cache = {};
  return {
    isStyleRendered: (key) => {
      return cache[key] === 1;
    },
    addStyleToCache: (key) => {
      cache[key] = 1;
    },
  };
});

export function CacheProvider({ children }) {
  return children;
}
