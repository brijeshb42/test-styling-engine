#!/bin/bash

sed -i '' '1s/^/"use client"\n/' dist/index.js
sed -i '' '1s/^/"use client"\n/' dist/index.mjs
