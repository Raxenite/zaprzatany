"""Generate WebP copies in the Jekyll output; leave source assets untouched."""

from pathlib import Path
import sys

from PIL import Image, ImageOps


def convert_images(directory, destination):
    sources = sorted(
        path for path in directory.rglob("*")
        if path.suffix.lower() in {".png", ".jpg", ".jpeg"}
    )
    targets = set()
    # Refuse ambiguous names before overwriting an existing WebP asset.
    for source in sources:
        target = source.with_suffix(".webp")
        if target in targets or target.exists():
            raise ValueError(f"WebP filename collision: {source} -> {target}")
        targets.add(target)

    for source in sources:
        target = destination / source.relative_to(directory).with_suffix(".webp")
        target.parent.mkdir(parents=True, exist_ok=True)
        with Image.open(source) as image:
            if getattr(image, "is_animated", False):
                raise ValueError(f"Animated image is unsupported; provide WebP: {source}")
            image = ImageOps.exif_transpose(image)
            if image.mode not in {"RGB", "RGBA"}:
                has_alpha = "A" in image.getbands() or "transparency" in image.info
                image = image.convert("RGBA" if has_alpha else "RGB")
            image.save(
                target,
                "WEBP",
                lossless=source.suffix.lower() == ".png",
                quality=82,
                method=6,
            )
    print(f"Converted {len(sources)} PNG/JPEG images to WebP.")


if __name__ == "__main__":
    convert_images(Path(sys.argv[1]), Path(sys.argv[2]))
