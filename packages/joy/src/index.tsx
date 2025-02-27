import * as React from 'react';

import { css } from '@joy/styling-engine';

const buttonStyles = css`
  .mui-Button {
    all: unset;
    box-sizing: border-box;
    line-height: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    user-select: none;
    vertical-align: top;
    background-clip: padding-box;
    text-align: center;
    font-style: normal;
    font-family: var(--button-typeface);
    font-weight: var(--button-weight);
    cursor: var(--cursor-button);

    /* Size */

    @breakpoints {
      &.size-1 {
        height: var(--button-size-1-h);
        font-size: var(--button-size-1-fs);
        padding-left: var(--button-size-1-px);
        padding-right: var(--button-size-1-px);
        border-radius: var(--button-size-1-radius);
        gap: 4px;
      }

      &.size-2 {
        height: var(--button-size-2-h);
        font-size: var(--button-size-2-fs);
        padding-left: var(--button-size-2-px);
        padding-right: var(--button-size-2-px);
        border-radius: var(--button-size-2-radius);
        gap: 8px;
      }

      &.size-3 {
        height: var(--button-size-3-h);
        font-size: var(--button-size-3-fs);
        padding-left: var(--button-size-3-px);
        padding-right: var(--button-size-3-px);
        border-radius: var(--button-size-3-radius);
        gap: 12px;
      }
    }

    /* Filled */

    &.variant-filled {
      color: var(--button-variant-filled-color);
      box-shadow: var(--button-variant-filled-shadow);
      border-width: var(--button-variant-filled-border-width);
      border-style: var(--button-variant-filled-border-style);
    }

    &.variant-filled.color-primary {
      background-color: var(--button-variant-filled-bg);
      border-color: var(--button-variant-filled-border-color);
    }

    &.variant-filled.color-primary:hover {
      background-color: var(--button-variant-filled-bg--hover);
      border-color: var(--button-variant-filled-border-color--hover);
    }

    &.variant-filled.color-primary:active {
      background-color: var(--button-variant-filled-bg--active);
      border-color: var(--button-variant-filled-border-color--active);
    }

    &.variant-filled.color-secondary {
      background-color: var(--secondary-9);
    }

    &.variant-filled.color-secondary:hover {
      background-color: var(--secondary-10);
    }

    &.variant-filled.color-secondary:active {
      background-color: var(--secondary-11);
    }

    &.variant-filled.color-success {
      background-color: var(--success-9);
    }

    &.variant-filled.color-success:hover {
      background-color: var(--success-10);
    }

    &.variant-filled.color-success:active {
      background-color: var(--success-11);
    }

    &.variant-filled.color-error {
      background-color: var(--error-9);
    }

    &.variant-filled.color-error:hover {
      background-color: var(--error-10);
    }

    &.variant-filled.color-error:active {
      background-color: var(--error-11);
    }

    &.variant-filled.color-gray {
      background-color: var(--gray-9);
    }

    &.variant-filled.color-gray:hover {
      background-color: var(--gray-10);
    }

    &.variant-filled.color-gray:active {
      background-color: var(--gray-11);
    }

    /* Outlined */

    &.variant-outlined {
      border-width: 1px;
      border-style: solid;
    }

    &.variant-outlined.color-primary {
      border-color: var(--primary-9);
      color: var(--primary-11);
    }

    &.variant-outlined.color-primary:hover {
      background-color: var(--primary-2);
    }

    &.variant-outlined.color-primary:active {
      background-color: var(--primary-3);
    }

    &.variant-outlined.color-secondary {
      border-color: var(--secondary-9);
      color: var(--secondary-11);
    }

    &.variant-outlined.color-secondary:hover {
      background-color: var(--secondary-2);
    }

    &.variant-outlined.color-secondary:active {
      background-color: var(--secondary-3);
    }

    &.variant-outlined.color-success {
      border-color: var(--primary-9);
      color: var(--primary-11);
    }

    &.variant-outlined.color-success:hover {
      background-color: var(--primary-2);
    }

    &.variant-outlined.color-success:active {
      background-color: var(--primary-3);
    }

    &.variant-outlined.color-error {
      border-color: var(--error-9);
      color: var(--error-11);
    }

    &.variant-outlined.color-error:hover {
      background-color: var(--error-2);
    }

    &.variant-outlined.color-error:active {
      background-color: var(--error-3);
    }

    &.variant-outlined.color-gray {
      border-color: var(--gray-9);
      color: var(--gray-11);
    }

    &.variant-outlined.color-gray:hover {
      background-color: var(--gray-2);
    }

    &.variant-outlined.color-gray:active {
      background-color: var(--gray-3);
    }

    /* Text */

    &.variant-text.color-primary {
      color: var(--primary-11);
    }

    &.variant-text.color-primary:hover {
      background-color: var(--primary-4);
    }

    &.variant-text.color-primary:active {
      background-color: var(--primary-5);
    }

    &.variant-text.color-secondary {
      color: var(--secondary-11);
    }

    &.variant-text.color-secondary:hover {
      background-color: var(--secondary-4);
    }

    &.variant-text.color-secondary:active {
      background-color: var(--secondary-5);
    }

    &.variant-text.color-success {
      color: var(--success-11);
    }

    &.variant-text.color-success:hover {
      background-color: var(--success-4);
    }

    &.variant-text.color-success:active {
      background-color: var(--success-5);
    }

    &.variant-text.color-error {
      color: var(--error-11);
    }

    &.variant-text.color-error:hover {
      background-color: var(--error-4);
    }

    &.variant-text.color-error:active {
      background-color: var(--error-5);
    }

    &.variant-text.color-gray {
      color: var(--gray-11);
    }

    &.variant-text.color-gray:hover {
      background-color: var(--gray-4);
    }

    &.variant-text.color-gray:active {
      background-color: var(--gray-5);
    }

    /* Focus */

    &:focus-visible {
      outline-width: 2px;
      outline-style: solid;
      outline-offset: 2px;
      outline-color: black;
    }

    /* Just messing */

    & span {
      background-color: hsl(0 0% 100% / 20%);
      border-radius: 9999px;
      padding: 3px 6px;
      font-size: 0.85em;
    }

    /* Disabled */
    &:disabled {
      cursor: var(--cursor-disabled);
    }

    @media (--xs) and (--lg) {
      .xs\:mui-b {
        bottom: var(--b-xs);
      }
    }
  }
`;

type ButtonProps = React.ComponentPropsWithRef<'button'>;

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, forwardedRef) => {
    const { className, ...rest } = props;

    console.log('Render button');

    return (
      <button
        type="button"
        {...rest}
        ref={forwardedRef}
        className={`mui-reset mui-Button${className ? ' ' + className : ''}`}
      >
        {buttonStyles}
        {rest.children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button };
