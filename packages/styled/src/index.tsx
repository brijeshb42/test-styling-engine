import * as React from 'react';
import type { CreateStyled, StyledOptions } from '@emotion/styled';
import { Interpolation } from '@emotion/serialize';
import isDevelopment from '#is-development';

import type { ElementType } from './types';
import {
  composeShouldForwardProps,
  getDefaultShouldForwardProp,
} from './utils';
import { processStyles } from './processStyles';

declare module '@emotion/styled' {
  export interface FilteringStyledOptions<
    Props = Record<string, any>,
    ForwardedProps extends keyof Props & string = keyof Props & string,
  > {
    label?: string;
    shouldForwardProp?: (propName: string) => propName is ForwardedProps;
    target?: string;
    precedence?: string;
  }

  export interface StyledOptions<Props = Record<string, any>> {
    label?: string;
    shouldForwardProp?: (propName: string) => boolean;
    target?: string;
    precedence?: string;
  }
}

function createStyled(tag: ElementType, options?: StyledOptions) {
  if (isDevelopment) {
    if (tag === undefined) {
      throw new Error(
        'You are trying to create a styled element with an undefined component.\nYou may have forgotten to import it.'
      );
    }
  }

  const isReal = !!tag.__emotion_real;
  const baseTag = (isReal && tag.__emotion_base) || tag;

  let identifierName: string | undefined;
  let targetClassName: string | undefined;
  let precedence: string | undefined = 'component';
  if (options !== undefined) {
    identifierName = options.label;
    targetClassName = options.target;
    precedence = options.precedence || 'component';
  }

  const shouldForwardProp = composeShouldForwardProps(tag, options, isReal);
  const defaultShouldForwardProp =
    shouldForwardProp || getDefaultShouldForwardProp(baseTag);
  const shouldUseAs = !defaultShouldForwardProp('as');

  function createStyledComponent() {
    let styles = Array.prototype.slice.call(arguments) as any as Array<
      TemplateStringsArray | Interpolation
    >;

    const processedStyles = processStyles(styles);

    const Styled: ElementType = React.forwardRef((props, ref) => {
      const FinalTag = (shouldUseAs && (props.as as React.ElementType)) || tag;
      let className = '';
      let mergedProps = props;

      // handle theme

      const finalShouldForwardProp =
        shouldUseAs && shouldForwardProp === undefined
          ? getDefaultShouldForwardProp(FinalTag)
          : defaultShouldForwardProp;

      let newProps: Record<string, unknown> = {};

      for (let key in props) {
        if (shouldUseAs && key === 'as') continue;

        if (finalShouldForwardProp(key)) {
          newProps[key] = props[key];
        }
      }
      if (ref) {
        newProps.ref = ref;
      }
      newProps.className =
        `${className} ${props.className ? ` ${props.className}` : ''}`.trim();

      return (
        <>
          {processedStyles.map((style) => {
            const result =
              style.type === 'dynamic' ? style.css(mergedProps) : style;
            newProps.className =
              `${newProps.className} ${result.className}`.trim();

            return (
              <style key={result.key} href={result.key} precedence={precedence}>
                {result.css}
              </style>
            );
          })}
          <FinalTag key="component" {...newProps} />
        </>
      );
    });

    Styled.displayName =
      identifierName !== undefined
        ? identifierName
        : `Styled(${
            typeof baseTag === 'string'
              ? baseTag
              : baseTag.displayName || baseTag.name || 'Component'
          })`;
    Styled.__emotion_real = true;
    Styled.__emotion_base = baseTag;
    Styled.__emotion_styles = styles;
    Styled.__emotion_forwardProp = shouldForwardProp;

    Styled.defaultProps = tag.defaultProps;

    return Styled;
  }

  return createStyledComponent;
}

export default createStyled as CreateStyled;
