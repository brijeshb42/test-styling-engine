import type core from '@babel/core';

export type Core = typeof core & {
  addNamedImport(
    name: string,
    source?: string
  ): ReturnType<(typeof core)['types']['identifier']>;
  addNamedStyleImport(
    name: string,
    source?: string
  ): ReturnType<(typeof core)['types']['identifier']>;
};
