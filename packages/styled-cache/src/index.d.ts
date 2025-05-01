import * as React from 'react';

export interface Options {
  nonce?: string;
  key: string;
}

export declare function CacheProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element;

export declare function useCache(): {
  isStyleRendered: (key: string) => boolean;
  addStyleToCache: (key: string, style: string) => void;
};
