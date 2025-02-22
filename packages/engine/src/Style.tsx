import * as React from "react";
import { useContext } from "@brijeshb42/styling-engine-context";

export function Style(props: React.StyleHTMLAttributes<HTMLStyleElement>) {
  const value = useContext<{ nonce: string }>();
  return <style {...props} nonce={value?.nonce} />;
}
