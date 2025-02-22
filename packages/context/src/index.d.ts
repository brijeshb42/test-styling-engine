import * as React from "react";

export declare function ContextProvider<T>(props: {
  value: T;
  children: React.ReactNode;
}): React.JSX.Element;

export declare function useContext<T>(): T | null;
