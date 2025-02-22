import * as React from "react";
import { useContext } from "@brijeshb42/styling-engine-context";

const useContextWithPromise = useContext as <T>() => Promise<T | null>;

export async function Style(
  props: React.StyleHTMLAttributes<HTMLStyleElement>
) {
  const value = await useContextWithPromise<{ nonce: string }>();
  return <style {...props} nonce={value?.nonce} />;
}
