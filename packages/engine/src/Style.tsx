import * as React from 'react';
import { useContext } from '@joy/styling-engine-context';

export function Style(props: React.StyleHTMLAttributes<HTMLStyleElement>) {
  const value = useContext<{ nonce: string }>();
  console.log({ value });
  return <style {...props} nonce={value?.nonce} />;
}
