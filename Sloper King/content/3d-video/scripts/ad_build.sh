#!/usr/bin/env bash
# Render every shot of the advert, then assemble it.   scripts/ad_build.sh PCT SAMPLES
# Shots already rendered at this PCT are skipped (delete renders/ad/tall_PCT/<shot> to redo one).
set -u
cd "$(dirname "$0")/.."
PCT=${1:-40}; S=${2:-16}
B="/c/Program Files/Blender Foundation/Blender 5.2/blender.exe"
shot() {  # blend name step start end [camera]
  local dir="renders/ad/tall_$PCT/$2"
  [ -d "$dir" ] && [ "$(ls "$dir" | wc -l)" -gt 0 ] && { echo "skip $2"; return; }
  "$B" -b "$1" -P scripts/render_shot.py -- "$2" tall "$PCT" "$S" "$3" "$4" "$5" ${6:-} > "renders/log_ad_$2.txt" 2>&1
  echo "$2: $(ls "$dir" | wc -l) frames"
}
shot sloperking_arms_ad.blend arms 2 1 1099 Cam_9x16
shot sloperking_arms_ad.blend close 2 1100 1250 Cam_close
shot sloperking_adshots.blend adjust 1 1 75
shot sloperking_adshots.blend strong 1 76 150
shot sloperking_adshots.blend light 1 151 225
shot sloperking_adshots.blend grip 1 226 300
shot sloperking_adshots.blend end 1 301 450
shot sloperking_adshots.blend train 1 451 585
"$B" -b --factory-startup -P scripts/ad_edit.py -- "$PCT" render > renders/log_ad_edit.txt 2>&1
grep -E "SHOT STARTS|RENDERED|Error|Traceback" renders/log_ad_edit.txt
