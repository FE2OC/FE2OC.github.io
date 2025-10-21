#!/usr/bin/env python3
import os
import json

# read environment variables set by the GitHub Action
name = os.environ.get('NAME', '').strip()
creator = os.environ.get('CREATOR', '').strip()
difficulty = os.environ.get('DIFFICULTY', '').strip()
mid = os.environ.get('ID', '').strip()
description = os.environ.get('DESCRIPTION', '').strip()

# create payload dictionary
payload = {
    "name": name,
    "creator": creator,
    "difficulty": difficulty,
    "id": mid,
    "thumbnail": f"https://mintiler-dev.github.io/thumbnails/{mid}.png",
    "description": description
}

# ensure maps folder exists
os.makedirs('maps', exist_ok=True)

# write JSON file
outpath = f"maps/{mid}.json"
with open(outpath, "w", encoding="utf-8") as f:
    json.dump(payload, f, ensure_ascii=False, indent=2)

print(f"wrote {outpath}")
