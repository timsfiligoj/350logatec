#!/usr/bin/env bash
# 350space radar: backfill Sentinel-1 flood frames for Planinsko polje via
# /api/vesolje/acquire-radar. Each call processes days oldest-first within
# ~45 s and returns `remaining`; we keep calling until nothing is left.
# Idempotent: stored days come back as "cached".
#
# Usage:
#   ./scripts/radar-backfill.sh                          # production, 2025-10-01 .. today
#   FROM=2026-11-01 ./scripts/radar-backfill.sh
#   ENDPOINT=https://preview-url.vercel.app BYPASS_TOKEN=xxx ./scripts/radar-backfill.sh
#   FORCE=true ./scripts/radar-backfill.sh               # re-render existing days

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
set -a
# shellcheck disable=SC1091
source "$PROJECT_ROOT/.env.local"
set +a

if [[ -z "${VESOLJE_TRIGGER_SECRET:-}" ]]; then
  echo "error: VESOLJE_TRIGGER_SECRET not present in .env.local" >&2
  exit 1
fi

ENDPOINT="${ENDPOINT:-https://www.350logatec.si}"
FROM="${FROM:-2025-10-01}"
TO="${TO:-$(date -u +%Y-%m-%d)}"
FORCE="${FORCE:-false}"
MAX_CALLS="${MAX_CALLS:-80}"

headers=(-H "Authorization: Bearer $VESOLJE_TRIGGER_SECRET" -H "Content-Type: application/json")
if [[ -n "${BYPASS_TOKEN:-}" ]]; then
  headers+=(-H "x-vercel-protection-bypass: $BYPASS_TOKEN")
fi

echo "radar backfill $FROM .. $TO against $ENDPOINT (force=$FORCE)"

for ((call = 1; call <= MAX_CALLS; call++)); do
  response="$(curl -sS -m 70 -X POST "$ENDPOINT/api/vesolje/acquire-radar" "${headers[@]}" \
    -d "{\"from\":\"$FROM\",\"to\":\"$TO\",\"force\":$FORCE}")"

  summary="$(printf '%s' "$response" | python3 -c '
import json, sys
try:
    d = json.load(sys.stdin)
except Exception:
    print("BAD_RESPONSE"); sys.exit()
if "error" in d:
    print("ERROR " + d["error"][:200]); sys.exit()
res = d["results"]
acq = [r for r in res if r["status"] == "acquired"]
for r in acq:
    print("  + %s  %5.2f km2" % (r["day"], r["metrics"]["water_km2"]))
for e in d["errors"]:
    print("  ! %s  %s" % (e["day"], e["error"][:120]))
print("STATUS acquired=%d cached=%d no_coverage=%d errors=%d remaining=%d" % (
    len(acq), sum(r["status"] == "cached" for r in res),
    sum(r["status"] == "no_coverage" for r in res), len(d["errors"]), len(d["remaining"])))
')"
  echo "$summary"
  status_line="$(printf '%s\n' "$summary" | tail -1)"

  if [[ "$status_line" == ERROR* || "$status_line" == BAD_RESPONSE ]]; then
    echo "stopping: $status_line" >&2
    exit 1
  fi
  if [[ "$status_line" == *"remaining=0"* ]]; then
    echo "done after $call call(s)"
    exit 0
  fi
  sleep 2
done

echo "stopped after MAX_CALLS=$MAX_CALLS calls; run again to continue" >&2
exit 1
