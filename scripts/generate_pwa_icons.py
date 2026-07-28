import os
from PIL import Image, ImageDraw, ImageFilter

def generate_icons():
    logo_path = os.path.join("public", "logo.png")
    if not os.path.exists(logo_path):
        print("logo.png not found!")
        return

    base_logo = Image.open(logo_path).convert("RGBA")

    sizes = [
        ("pwa-192x192.png", (192, 192), 0.7),
        ("pwa-512x512.png", (512, 512), 0.7),
        ("pwa-maskable-512x512.png", (512, 512), 0.6), # Maskable icon requires 10-20% safe zone margin
        ("apple-touch-icon.png", (180, 180), 0.75)
    ]

    for filename, (w, h), scale in sizes:
        # Create dark background image
        bg = Image.new("RGBA", (w, h), (11, 15, 25, 255)) # #0B0F19
        draw = ImageDraw.Draw(bg)

        # Draw subtle radial ring
        draw.ellipse([int(w * 0.05), int(h * 0.05), int(w * 0.95), int(h * 0.95)], fill=None, outline=(59, 130, 246, 60), width=max(2, int(w * 0.01)))

        # Calculate target size for logo
        aspect = base_logo.width / base_logo.height
        target_w = int(w * scale)
        target_h = int(target_w / aspect)

        if target_h > int(h * scale):
            target_h = int(h * scale)
            target_w = int(target_h * aspect)

        # Resize logo with high quality lanczos
        resized_logo = base_logo.resize((target_w, target_h), Image.LANCZOS)

        # Center logo
        offset_x = (w - target_w) // 2
        offset_y = (h - target_h) // 2
        bg.paste(resized_logo, (offset_x, offset_y), resized_logo)

        # Save icon
        out_path = os.path.join("public", filename)
        bg.save(out_path, "PNG")
        print(f"Generated {out_path} ({w}x{h})")

if __name__ == "__main__":
    generate_icons()
