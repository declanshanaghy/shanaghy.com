#!/usr/bin/env python3
"""Convert PNG assets to WebP and rewrite source references.

Usage (from repo root):
  python3 web/scripts/optimize_images.py [--rewrite-refs] [--dry-run]

Steps:
  1. Find all *.png under web/public/assets/
  2. Resize to max-dimension 512 (maintaining aspect ratio)
  3. Save as *.webp sibling (quality 80)
  4. If --rewrite-refs: replace *.png -> *.webp in all HTML/JS/JSON source files

Safe to re-run: existing *.webp files are overwritten.
"""

import argparse
import os
import re
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow is required: pip install Pillow")

REPO_ROOT = Path(__file__).resolve().parents[2]
ASSETS_DIR = REPO_ROOT / "web" / "public" / "assets"
MAX_DIM = 512
WEBP_QUALITY = 80

SOURCE_ROOTS = [
    REPO_ROOT / "web" / "content",
    REPO_ROOT / "web" / "components",
    REPO_ROOT / "web" / "pages",
]
SOURCE_EXTS = {".html", ".js", ".jsx", ".json"}


def convert_png_to_webp(png_path: Path, dry_run: bool) -> dict:
    webp_path = png_path.with_suffix(".webp")
    with Image.open(png_path) as img:
        orig_w, orig_h = img.size
        scale = min(MAX_DIM / orig_w, MAX_DIM / orig_h, 1.0)
        new_w = round(orig_w * scale)
        new_h = round(orig_h * scale)

        orig_bytes = png_path.stat().st_size
        if not dry_run:
            if img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info):
                converted = img.convert("RGBA") if img.mode != "RGBA" else img
            else:
                converted = img.convert("RGB")
            if scale < 1.0:
                converted = converted.resize((new_w, new_h), Image.LANCZOS)
            converted.save(webp_path, "WEBP", quality=WEBP_QUALITY, method=6)
            new_bytes = webp_path.stat().st_size
        else:
            new_bytes = 0

    return {
        "png": png_path,
        "webp": webp_path,
        "orig_size": orig_bytes,
        "new_size": new_bytes,
        "orig_dims": (orig_w, orig_h),
        "new_dims": (new_w, new_h),
    }


def rewrite_refs_in_file(path: Path, dry_run: bool) -> int:
    text = path.read_text(encoding="utf-8")
    new_text = re.sub(r'(/assets/[^"\'>\s]+)\.png', r"\1.webp", text)
    if new_text == text:
        return 0
    count = text.count(".png") - new_text.count(".png")
    if not dry_run:
        path.write_text(new_text, encoding="utf-8")
    return count


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--rewrite-refs", action="store_true", help="Rewrite .png -> .webp in source files")
    parser.add_argument("--dry-run", action="store_true", help="Report without writing any files")
    args = parser.parse_args()

    png_files = sorted(ASSETS_DIR.rglob("*.png"))
    print(f"Found {len(png_files)} PNG files under {ASSETS_DIR}")

    total_orig = 0
    total_new = 0
    for png in png_files:
        result = convert_png_to_webp(png, args.dry_run)
        total_orig += result["orig_size"]
        total_new += result["new_size"]
        rel = result["png"].relative_to(REPO_ROOT)
        dims = f"{result['orig_dims'][0]}x{result['orig_dims'][1]}"
        if result["orig_dims"] != result["new_dims"]:
            dims += f" -> {result['new_dims'][0]}x{result['new_dims'][1]}"
        savings = (1 - result["new_size"] / result["orig_size"]) * 100 if result["orig_size"] else 0
        flag = "[dry]" if args.dry_run else ""
        print(f"  {flag} {rel}  {result['orig_size']//1024}KB -> {result['new_size']//1024}KB  ({savings:.0f}% saved)  {dims}")

    if not args.dry_run:
        print(f"\nTotal: {total_orig//1024//1024}MB -> {total_new//1024//1024}MB ({(1-total_new/total_orig)*100:.1f}% saved)")

    if args.rewrite_refs:
        print("\nRewriting .png -> .webp in source files...")
        total_rewrites = 0
        for root in SOURCE_ROOTS:
            for path in sorted(root.rglob("*")):
                if path.suffix in SOURCE_EXTS and path.is_file():
                    count = rewrite_refs_in_file(path, args.dry_run)
                    if count:
                        total_rewrites += count
                        flag = "[dry]" if args.dry_run else ""
                        print(f"  {flag} {path.relative_to(REPO_ROOT)}  ({count} refs rewritten)")
        print(f"  Total refs rewritten: {total_rewrites}")


if __name__ == "__main__":
    main()
