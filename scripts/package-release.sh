#!/usr/bin/env bash
set -euo pipefail

VERSION=$(node -p "require('./package.json').version")
mkdir -p release
git archive \
  --format=tar.gz \
  --prefix="ravika-pos-$VERSION/" \
  --output="release/ravika-pos-$VERSION.tar.gz" \
  HEAD
printf 'release/ravika-pos-%s.tar.gz\n' "$VERSION"
