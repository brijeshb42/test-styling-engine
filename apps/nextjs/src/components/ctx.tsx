'use client';

import * as React from 'react';

export const AppContext = React.createContext({});

export function AppContextProvider({
  value,
  children,
}: {
  value: any;
  children: React.ReactNode;
}) {
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
