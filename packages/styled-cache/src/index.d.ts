import * as React from 'react';

export interface Options {
  nonce?: string;
  key: string;
}

type Cache = {
  isStyleRendered: (key: string) => boolean;
  addStyleToCache: (key: string, style: string) => void;
};

export declare function StyledCacheProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element;

export declare function useStyledCache(): Cache;
