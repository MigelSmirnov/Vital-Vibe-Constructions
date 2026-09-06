#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 || $# -gt 2 ]]; then
  echo "Usage: $0 <vps-site-bundle.tgz> [release-id]" >&2
  exit 2
fi

bundle="$1"
release_id="${2:-$(date -u +%Y%m%dT%H%M%SZ)}"
base_dir="${VVC_RELEASE_ROOT:-/srv/vital-vibe}"
releases_dir="$base_dir/releases"
release_dir="$releases_dir/$release_id"
current_link="$base_dir/current"
next_link="$base_dir/.current-next"

if [[ ! -f "$bundle" ]]; then
  echo "Bundle not found: $bundle" >&2
  exit 1
fi

if [[ -e "$release_dir" ]]; then
  echo "Release already exists: $release_dir" >&2
  exit 1
fi

mkdir -p "$release_dir"
tar -xzf "$bundle" -C "$release_dir"

for required in index.html sitemap.xml robots.txt DEPLOYMENT_COMMIT; do
  if [[ ! -f "$release_dir/$required" ]]; then
    echo "Release is missing required file: $required" >&2
    rm -rf "$release_dir"
    exit 1
  fi
done

ln -s "$release_dir" "$next_link"
mv -Tf "$next_link" "$current_link"

echo "Activated release: $release_id"
echo "Deployment commit: $(cat "$release_dir/DEPLOYMENT_COMMIT")"
echo "Current root: $(readlink -f "$current_link")"
