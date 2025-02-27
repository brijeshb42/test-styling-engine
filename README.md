# Styled Engine

## Things that work -

1. Aliasing to a different path within a package in `node_modules`.
2. Changing breakpoints at runtime through package aliasing.
3. Accessing `nonce` value at runtime and setting it on to the `<style>` tag. The actual [issue](https://github.com/facebook/react/issues/32449) is in React itself where it doesn't apply the `nonce` value to the `style` tag.

## Things that don't work

1. Aliasing to a local file during dev mode (Next.js issue) since Turbopack doesn't support it yet. This works in prod mode though. So changing breakpoints wont work fully.
