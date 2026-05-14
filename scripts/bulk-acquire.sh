#!/usr/bin/env bash
# 350space — one-time backfill of 5 years × 12 months × 4 view_kinds against
# the /api/vesolje/acquire endpoint. Reads VESOLJE_TRIGGER_SECRET from
# .env.local (relative to this script's project root). Idempotent: returns
# "cached" for rows that already exist.
#
# Usage:
#   ./scripts/bulk-acquire.sh                              # production, all kinds, 2021-2026
#   ENDPOINT=https://preview-url.vercel.app ./scripts/bulk-acquire.sh
#   KINDS="ndvi ndwi" ./scripts/bulk-acquire.sh
#   YEARS="2024 2025 2026" ./scripts/bulk-acquire.sh
#   BYPASS_TOKEN=xxx ./scripts/bulk-acquire.sh             # for preview deploys
#
# Logs per-iteration status to stdout. Sleeps 2s between requests to avoid
# rate-limiting the CDSE APIs.

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ ! -f "$PROJECT_ROOT/.env.local" ]]; then
  echo "error: $PROJECT_ROOT/.env.local not found" >&2
  exit 1
fi

# shellcheck disable=SC1091
set -a
source "$PROJECT_ROOT/.env.local"
set +a

if [[ -z "${VESOLJE_TRIGGER_SECRET:-}" ]]; then
  echo "error: VESOLJE_TRIGGER_SECRET not present in .env.local" >&2
  exit 1
fi

ENDPOINT="${ENDPOINT:-https://www.350logatec.si}"
KINDS="${KINDS:-true_color ndvi ndwi ndsi}"
YEARS="${YEARS:-2021 2022 2023 2024 2025 2026}"
MONTHS="01 02 03 04 05 06 07 08 09 10 11 12"
SLEEP_BETWEEN="${SLEEP_BETWEEN:-2}"

CURL_HEADERS=(-H "Authorization: Bearer $VESOLJE_TRIGGER_SECRET" -H "Content-Type: application/json")
if [[ -n "${BYPASS_TOKEN:-}" ]]; then
  CURL_HEADERS+=(-H "x-vercel-protection-bypass: $BYPASS_TOKEN")
fi

total=0
acquired=0
cached=0
failed=0
skipped_no_scene=0

for kind in $KINDS; do
  for year in $YEARS; do
    for month in $MONTHS; do
      ym="$year-$month"
      total=$((total + 1))

      body=$(printf '{"view_kind":"%s","month":"%s"}' "$kind" "$ym")
      printf '[%3d] %-10s %s ... ' "$total" "$kind" "$ym"

      http_status=$(curl -sS -o /tmp/bulk-acquire-resp.json -w "%{http_code}" \
        -X POST "${CURL_HEADERS[@]}" -d "$body" \
        "$ENDPOINT/api/vesolje/acquire" || echo "000")

      if [[ "$http_status" == "200" ]]; then
        status=$(grep -o '"status":"[^"]*"' /tmp/bulk-acquire-resp.json | head -1 | cut -d'"' -f4)
        if [[ "$status" == "acquired" ]]; then
          acquired=$((acquired + 1))
          echo "acquired"
        elif [[ "$status" == "cached" ]]; then
          cached=$((cached + 1))
          echo "cached"
        else
          echo "unexpected response: $(cat /tmp/bulk-acquire-resp.json)"
          failed=$((failed + 1))
        fi
      elif [[ "$http_status" == "500" ]] && grep -q "No Sentinel-2 scene" /tmp/bulk-acquire-resp.json; then
        skipped_no_scene=$((skipped_no_scene + 1))
        echo "no scene (too cloudy or before Sentinel-2 era)"
      else
        failed=$((failed + 1))
        echo "FAILED http=$http_status body=$(cat /tmp/bulk-acquire-resp.json)"
      fi

      sleep "$SLEEP_BETWEEN"
    done
  done
done

echo
echo "==== bulk-acquire summary ===="
echo "total:            $total"
echo "acquired:         $acquired"
echo "cached:           $cached"
echo "skipped no scene: $skipped_no_scene"
echo "failed:           $failed"
