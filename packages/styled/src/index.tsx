import * as React from 'react';
import type { CreateStyled, StyledOptions } from '@emotion/styled';
import { serializeStyles, Interpolation } from '@emotion/serialize';
import isDevelopment from '#is-development';
import { generateCss as generateStylisCss } from '@brijbyte/styled-preprocessor-stylis';

import type { ElementType } from './types';
import {
  composeShouldForwardProps,
  getDefaultShouldForwardProp,
} from './utils';

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

function isArgsTaggedTemplateLiteral(args: any[]) {
  const result =
    args.length > 0 &&
    Array.isArray(args[0]) &&
    Object.prototype.hasOwnProperty.call(args[0], 'raw');

  if (!result) {
    return {
      result,
      hasDynamicStyles: false,
    };
  }

  const hasDynamicStyles = args.some((item) => typeof item === 'function');

  return {
    result,
    hasDynamicStyles: result && hasDynamicStyles,
  };
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
  let precedence: string | undefined;
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

    let generatedStaticStyles: {
      key: string;
      className: string;
      css: string;
    }[] = [];

    const { result: isTaggedTemplateLiteral, hasDynamicStyles } =
      isArgsTaggedTemplateLiteral(styles);

    if (isTaggedTemplateLiteral) {
      if (!hasDynamicStyles) {
        const serialized = serializeStyles(styles, undefined);
        const className = `css-${serialized.name}`;
        generatedStaticStyles.push({
          key: serialized.name,
          className,
          css: generateStylisCss(`.${className}`, serialized.styles),
        });
      }
    }

    const staticClasses = generatedStaticStyles
      .map((style) => style.className)
      .join(' ');
    const staticStyles = generatedStaticStyles.map((style) => {
      return (
        <style key={style.key} href={style.key} precedence="component">
          {style.css}
        </style>
      );
    });

    const Styled: ElementType = React.forwardRef((props, ref) => {
      const FinalTag = (shouldUseAs && (props.as as React.ElementType)) || tag;
      let className = '';
      let mergedProps = props;

      if (props.theme == null) {
        mergedProps = {};
        for (let key in props) {
          mergedProps[key] = props[key];
        }
      }

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
      newProps.className =
        `${className} ${staticClasses}${props.className ? ` ${props.className}` : ''}`.trim();
      if (ref) {
        newProps.ref = ref;
      }

      return (
        <>
          <FinalTag key="component" {...newProps} />
          {staticStyles}
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
