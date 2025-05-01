export function generateBaseCache(
  cacheKeys: Record<string, string | number> = {}
) {
  return {
    isStyleRendered: (key: string) => {
      return cacheKeys[key] === 1;
    },
    addStyleToCache: (key: string) => {
      cacheKeys[key] = 1;
    },
  };
}
