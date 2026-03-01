#!/usr/bin/env python3
"""
Generate recipe thumbnails via ComfyUI API.
Usage:
  python3 scripts/generate-thumbnails.sh [--dry-run] [--batch-size N] [--file FILE] [--slug SLUG]
"""

import json, os, sys, time, subprocess, glob, argparse

API_URL = "https://comfyui.aifrends.com"
API_KEY = "4orSrEnohtOIR3TerdBDpIrWhmMxaaPCPWkBlDlVYSddkgtmLgtSvV-d-RPntTwY"
OUTPUT_DIR = "outputs/thumbnails"
RECIPES_DIR = "scripts/data/recipes"
POLL_INTERVAL = 8
MAX_POLL_ATTEMPTS = 60

def build_prompt(recipe: dict) -> str:
    title = recipe["title"]
    cuisine = recipe.get("cuisine", "")
    course = recipe.get("course", "")
    return (
        f"professional food photography, {title}, {cuisine} cuisine, {course}, "
        f"beautifully plated, natural lighting, shallow depth of field, "
        f"overhead shot, wooden table, warm tones, appetizing, "
        f"high resolution, editorial style, restaurant quality presentation"
    )

def curl_post(path: str, data: dict) -> dict:
    result = subprocess.run(
        ["curl", "-s", "-X", "POST", f"{API_URL}{path}",
         "-H", f"Authorization: Bearer {API_KEY}",
         "-H", "Content-Type: application/json",
         "-d", json.dumps(data)],
        capture_output=True, text=True, timeout=30,
    )
    return json.loads(result.stdout)

def curl_get(path: str) -> dict:
    result = subprocess.run(
        ["curl", "-s", f"{API_URL}{path}",
         "-H", f"Authorization: Bearer {API_KEY}"],
        capture_output=True, text=True, timeout=30,
    )
    return json.loads(result.stdout)

def curl_download(path: str, output_path: str):
    subprocess.run(
        ["curl", "-s", f"{API_URL}{path}",
         "-H", f"Authorization: Bearer {API_KEY}",
         "-o", output_path],
        timeout=60,
    )

def submit_job(prompt: str) -> str:
    result = curl_post("/generate", {"prompt": prompt})
    return result["prompt_id"]

def poll_result(prompt_id: str):
    for _ in range(MAX_POLL_ATTEMPTS):
        result = curl_get(f"/result/{prompt_id}")
        status = result.get("status", "pending")
        if status == "completed":
            for key in result.get("outputs", {}):
                images = result["outputs"][key].get("images", [])
                if images:
                    return images[0]["filename"]
            return None
        elif status == "failed":
            return None
        time.sleep(POLL_INTERVAL)
    return None

def main():
    parser = argparse.ArgumentParser(description="Generate recipe thumbnails")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--batch-size", type=int, default=5)
    parser.add_argument("--file", type=str, default="", help="Filter to a specific recipe JSON file")
    parser.add_argument("--slug", type=str, default="", help="Generate only for a specific recipe slug")
    args = parser.parse_args()

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Collect recipes
    files = sorted(glob.glob(os.path.join(RECIPES_DIR, "*.json")))
    if args.file:
        files = [f for f in files if os.path.basename(f) == os.path.basename(args.file)]

    recipes = []
    for f in files:
        with open(f) as fh:
            data = json.load(fh)
            for r in data:
                if args.slug and r["slug"] != args.slug:
                    continue
                recipes.append(r)

    total = len(recipes)
    print(f"=== Recipe Thumbnail Generator ===")
    print(f"Output: {OUTPUT_DIR}")
    print(f"Batch size: {args.batch_size}")
    print(f"Total recipes: {total}")
    print()

    done = 0
    skipped = 0
    failed = 0

    # Process in batches
    batch = []  # list of (prompt_id, slug)

    for i, recipe in enumerate(recipes):
        slug = recipe["slug"]
        output_path = os.path.join(OUTPUT_DIR, f"{slug}.png")

        if os.path.exists(output_path):
            skipped += 1
            print(f"  SKIP {slug} (exists)")
            continue

        prompt = build_prompt(recipe)

        if args.dry_run:
            print(f"  DRY-RUN {slug}: {prompt[:80]}...")
            done += 1
            continue

        # Submit job
        try:
            prompt_id = submit_job(prompt)
            batch.append((prompt_id, slug))
            print(f"  SUBMIT {slug} -> {prompt_id[:12]}...")
        except Exception as e:
            print(f"  FAIL {slug}: {e}")
            failed += 1
            continue

        # When batch is full, wait for all
        if len(batch) >= args.batch_size:
            print(f"  --- Waiting for batch ({len(batch)} jobs) ---")
            for pid, s in batch:
                image_file = poll_result(pid)
                if image_file:
                    curl_download(f"/image/{image_file}", os.path.join(OUTPUT_DIR, f"{s}.png"))
                    done += 1
                    print(f"  ✓ {s} ({done + skipped}/{total})")
                else:
                    failed += 1
                    print(f"  ✗ {s}: generation failed")
            batch = []

    # Process remaining
    if batch:
        print(f"  --- Waiting for final batch ({len(batch)} jobs) ---")
        for pid, s in batch:
            image_file = poll_result(pid)
            if image_file:
                curl_download(f"/image/{image_file}", os.path.join(OUTPUT_DIR, f"{s}.png"))
                done += 1
                print(f"  ✓ {s} ({done + skipped}/{total})")
            else:
                failed += 1
                print(f"  ✗ {s}: generation failed")

    print()
    print(f"=== Done ===")
    print(f"Generated: {done}")
    print(f"Skipped:   {skipped}")
    print(f"Failed:    {failed}")
    print(f"Total:     {total}")

if __name__ == "__main__":
    main()
