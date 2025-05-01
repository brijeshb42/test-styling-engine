'use server';
import * as React from 'react';

import { generateBaseCache } from './common';

export const useStyledCache = React.cache(generateBaseCache);

export function StyledCacheProvider({ children }) {
  return children;
}
