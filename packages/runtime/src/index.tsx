import * as React from 'react';
import type { Interpolation, Theme } from '@emotion/react';
import type { CreateStyled, StyledOptions } from '@emotion/styled';
import { serializeStyles } from '@emotion/serialize';
import isDevelopment from '#is-development';
import { generateCss as generateStylisCss } from '@joy/styled-preprocessor-stylis';

import type { ElementType } from './types';
import {
  composeShouldForwardProps,
  getDefaultShouldForwardProp,
} from './utils';

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
  if (options !== undefined) {
    identifierName = options.label;
    targetClassName = options.target;
  }

  const shouldForwardProp = composeShouldForwardProps(tag, options, isReal);
  const defaultShouldForwardProp =
    shouldForwardProp || getDefaultShouldForwardProp(baseTag);
  const shouldUseAs = !defaultShouldForwardProp('as');

  function createStyledComponent() {
    let styles = Array.prototype.slice.call(arguments) as any as Array<
      TemplateStringsArray | Interpolation<Theme>
    >;

    let generatedStaticStyles: Record<string, [string, string]> = {};

    const res = isArgsTaggedTemplateLiteral(styles);

    if (res.result) {
      if (!res.hasDynamicStyles) {
        const serialized = serializeStyles(styles, undefined);
        const className = `css-${serialized.name}`;
        generatedStaticStyles[serialized.name] = [
          className,
          generateStylisCss(`.${className}`, serialized.styles),
        ];
      }
    }

    const staticClasses = Object.keys(generatedStaticStyles)
      .map((key) => generatedStaticStyles[key][0])
      .join(' ');
    const staticStyles = Object.keys(generatedStaticStyles).map((key) => {
      return (
        <style key={key} href={key} precedence="component">
          {generatedStaticStyles[key][1]}
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
    Styled.__emotion_forwardProp = shouldForwardProp;

    Styled.defaultProps = tag.defaultProps;

    return Styled;
  }

  return createStyledComponent;
}

export default createStyled as CreateStyled;
