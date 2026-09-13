#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
OUT="${1:-$ROOT/artifacts/responsive-home}"

if ! command -v cwebp >/dev/null 2>&1; then
  echo "cwebp is required (Ubuntu: sudo apt-get install webp)" >&2
  exit 1
fi

if command -v magick >/dev/null 2>&1; then
  IMAGE_TOOL="magick"
elif command -v convert >/dev/null 2>&1; then
  IMAGE_TOOL="convert"
else
  echo "ImageMagick is required to auto-orient source photos (Ubuntu: sudo apt-get install imagemagick)" >&2
  exit 1
fi

rm -rf "$OUT"
mkdir -p \
  "$OUT/assets/responsive/home" \
  "$OUT/assets/responsive/estandar" \
  "$OUT/assets/responsive/smart" \
  "$OUT/assets/responsive/premium"

make_webp() {
  local source="$1"
  local output="$2"
  local width="$3"
  local temp
  temp="$(mktemp --suffix=.png)"
  trap 'rm -f "$temp"' RETURN
  "$IMAGE_TOOL" "$ROOT/$source" -auto-orient -resize "${width}x" -strip "$temp"
  cwebp -quiet -mt -m 6 -q 82 "$temp" -o "$OUT/$output"
  rm -f "$temp"
  trap - RETURN
}

# Homepage featured bathroom.
make_webp "assets/home/bathroom-retouched.png" "assets/responsive/home/bathroom-retouched-480.webp" 480
make_webp "assets/home/bathroom-retouched.png" "assets/responsive/home/bathroom-retouched-768.webp" 768
make_webp "assets/home/bathroom-retouched.png" "assets/responsive/home/bathroom-retouched-1086.webp" 1086

# Standard-renovation project. The lead image is also reused on the homepage and project index.
for width in 480 768 1200; do
  make_webp "estandar/cocina.jpeg" "assets/responsive/estandar/cocina-${width}.webp" "$width"
  make_webp "estandar/obra.jpeg" "assets/responsive/estandar/obra-${width}.webp" "$width"
  make_webp "estandar/suelo-base.jpeg" "assets/responsive/estandar/suelo-base-${width}.webp" "$width"
  make_webp "estandar/parquet.jpeg" "assets/responsive/estandar/parquet-${width}.webp" "$width"
  make_webp "estandar/pintura.jpeg" "assets/responsive/estandar/pintura-${width}.webp" "$width"
  make_webp "estandar/pasillo.jpeg" "assets/responsive/estandar/pasillo-${width}.webp" "$width"
done

# Homepage Smart Home block.
for width in 320 640 960; do
  make_webp "smart/gira.jpeg" "assets/responsive/smart/gira-${width}.webp" "$width"
  make_webp "premium/panel-marmol.jpeg" "assets/responsive/premium/panel-marmol-${width}.webp" "$width"
  make_webp "premium/gira.jpeg" "assets/responsive/premium/gira-${width}.webp" "$width"
  make_webp "premium/apple-home.jpeg" "assets/responsive/premium/apple-home-${width}.webp" "$width"
  make_webp "smart/escenas.jpeg" "assets/responsive/smart/escenas-${width}.webp" "$width"
done

{
  echo "# Responsive image derivatives"
  echo
  echo "Generated after EXIF auto-orientation with ImageMagick, then encoded with cwebp q=82, method=6. Originals are retained as fallbacks."
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
