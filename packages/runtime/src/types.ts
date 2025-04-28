import type * as React from 'react';
import type { Theme } from '@emotion/react';
import type { Interpolation } from '@emotion/styled';

export type ElementType = React.ElementType & {
  defaultProps?: Partial<any>;
  __emotion_real?: boolean;
  __emotion_base?: ElementType;
  __emotion_styles?: Interpolation<Theme>[];
  __emotion_forwardProp?: (propName: string) => boolean;
};
