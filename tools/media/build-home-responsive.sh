#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
OUT="${1:-$ROOT/artifacts/responsive-home}"

if ! command -v cwebp >/dev/null 2>&1; then
  echo "cwebp is required (Ubuntu: sudo apt-get install webp)" >&2
  exit 1
fi

rm -rf "$OUT"
mkdir -p "$OUT/assets/responsive/home" "$OUT/assets/responsive/estandar"

make_webp() {
  local source="$1"
  local output="$2"
  local width="$3"
  cwebp -quiet -mt -m 6 -q 82 -resize "$width" 0 "$ROOT/$source" -o "$OUT/$output"
}

make_webp "assets/home/bathroom-retouched.png" "assets/responsive/home/bathroom-retouched-480.webp" 480
make_webp "assets/home/bathroom-retouched.png" "assets/responsive/home/bathroom-retouched-768.webp" 768
make_webp "assets/home/bathroom-retouched.png" "assets/responsive/home/bathroom-retouched-1086.webp" 1086

make_webp "estandar/cocina.jpeg" "assets/responsive/estandar/cocina-480.webp" 480
make_webp "estandar/cocina.jpeg" "assets/responsive/estandar/cocina-768.webp" 768
make_webp "estandar/cocina.jpeg" "assets/responsive/estandar/cocina-1200.webp" 1200

{
  echo "# Homepage responsive image derivatives"
  echo
  echo "Generated with cwebp q=82, method=6. Originals are retained as fallbacks."
  echo
  echo "| File | Bytes |"
  echo "| --- | ---: |"
  while IFS= read -r file; do
    rel="${file#$OUT/}"
    bytes="$(wc -c < "$file" | tr -d ' ')"
    echo "| $rel | $bytes |"
  done < <(find "$OUT/assets" -type f -name '*.webp' | sort)
} > "$OUT/report.md"

cat "$OUT/report.md"
