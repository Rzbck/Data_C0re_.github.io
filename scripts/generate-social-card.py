from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets" / "media" / "lumina" / "tunnel-blue.webp"
OUTPUT = ROOT / "assets" / "img" / "og-cover-v2.jpg"
TARGET = (1200, 630)


def main() -> None:
    if not SOURCE.exists():
        raise SystemExit(f"Missing social-card source: {SOURCE}")

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(SOURCE) as source:
        image = ImageOps.exif_transpose(source).convert("RGB")
        card = ImageOps.fit(
            image,
            TARGET,
            method=Image.Resampling.LANCZOS,
            centering=(0.5, 0.5),
        )
        card.save(
            OUTPUT,
            format="JPEG",
            quality=88,
            optimize=True,
            progressive=True,
            subsampling="4:2:0",
        )

    with Image.open(OUTPUT) as generated:
        if generated.size != TARGET:
            raise SystemExit(f"Unexpected social-card size: {generated.size}")

    print(f"Generated {OUTPUT.relative_to(ROOT)} at {TARGET[0]}x{TARGET[1]}")


if __name__ == "__main__":
    main()
