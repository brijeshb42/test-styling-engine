import * as React from 'react';
import { useContext } from '@joy/styling-engine-context';

const useContextWithPromise = useContext as <T>() => Promise<T | null>;

export async function Style(
  props: React.StyleHTMLAttributes<HTMLStyleElement>
) {
  console.log('Render style start');
  const value = await useContextWithPromise<{ nonce: string }>();
  console.log('Render style after');
  console.log({ value });
  return <style {...props} nonce={value?.nonce} />;
}
