import { headers } from 'next/headers';

export async function getValue() {
  const nonce = (await headers()).get('x-nonce');
  return { nonce };
}
