#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <release-id>" >&2
  exit 2
fi

release_id="$1"
base_dir="${VVC_RELEASE_ROOT:-/srv/vital-vibe}"
release_dir="$base_dir/releases/$release_id"
current_link="$base_dir/current"
next_link="$base_dir/.current-next"

if [[ ! -d "$release_dir" ]]; then
  echo "Release not found: $release_dir" >&2
  exit 1
fi

ln -s "$release_dir" "$next_link"
mv -Tf "$next_link" "$current_link"

echo "Rolled back to release: $release_id"
echo "Deployment commit: $(cat "$release_dir/DEPLOYMENT_COMMIT")"
echo "Current root: $(readlink -f "$current_link")"
