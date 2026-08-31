#!/usr/bin/env python3
import sys
import os
import argparse
from PIL import Image, ImageOps

ASPECT_RATIOS = {
    'portrait': (1080, 1350),      # 4:5
    '4:5': (1080, 1350),
    'square': (1080, 1080),        # 1:1
    '1:1': (1080, 1080),
    'landscape': (1080, 566),      # 1.91:1
    '1.91:1': (1080, 566),
    'story': (1080, 1920),         # 9:16
    '9:16': (1080, 1920),
    'linkedin': (1200, 800),       # 3:2
    '3:2': (1200, 800)
}

def crop_and_resize(input_path, output_path, target_width, target_height, centering=(0.5, 0.5)):
    img = Image.open(input_path)
    # Fix orientation from EXIF
    img = ImageOps.exif_transpose(img)

    if img.mode in ('RGBA', 'P'):
        img = img.convert('RGB')

    # Fit image to target aspect ratio using smart crop
    fitted = ImageOps.fit(img, (target_width, target_height), centering=centering, method=Image.Resampling.LANCZOS)

    # Ensure output dir exists
    out_dir = os.path.dirname(os.path.abspath(output_path))
    if out_dir:
        os.makedirs(out_dir, exist_ok=True)
    fitted.save(output_path, 'JPEG', quality=95, optimize=True)
    print(f"✓ Cropped and saved: {output_path} ({target_width}x{target_height})")

def main():
    parser = argparse.ArgumentParser(description="FRE2028 Smart Image Cropper & Resizer")
    parser.add_argument("input", help="Path to input image")
    parser.add_argument("-o", "--output", help="Path to output image (default: overwrites or adds _cropped)")
    parser.add_argument("-f", "--format", choices=list(ASPECT_RATIOS.keys()), default="4:5", help="Target aspect ratio / format (default: 4:5)")
    parser.add_argument("--top", action="store_true", help="Align crop to top instead of center (useful for tall portraits)")
    parser.add_argument("--bottom", action="store_true", help="Align crop to bottom instead of center")

    args = parser.parse_args()

    target_w, target_h = ASPECT_RATIOS[args.format]
    out_path = args.output
    if not out_path:
        base, ext = os.path.splitext(args.input)
        out_path = f"{base}_{args.format.replace(':', '_')}.jpg"

    centering = (0.5, 0.5)
    if args.top:
        centering = (0.5, 0.0)
    elif args.bottom:
        centering = (0.5, 1.0)

    crop_and_resize(args.input, out_path, target_w, target_h, centering)

if __name__ == "__main__":
    main()
