'use client';
import * as React from 'react';

const Context = React.createContext(null);

export const ContextProvider = Context.Provider;

export function useContext() {
  return React.useContext(Context);
}
