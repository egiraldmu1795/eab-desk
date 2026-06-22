# Generates og.png (1200x630) for the EAB Paper-Trading Desk site.
# Same brand system as business/storefront/og_gen.py, desk copy. Run: python og_gen.py
from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
BG = (10, 14, 20)
INK = (232, 237, 246)
MUT = (154, 167, 189)
GREEN = (74, 222, 128)
CYAN = (34, 211, 238)
PANEL = (18, 24, 38)
LINE = (31, 41, 55)

def lerp(a, b, t): return tuple(int(a[i] + (b[i]-a[i])*t) for i in range(3))

def hgrad(w, h, c0, c1):
    img = Image.new("RGB", (w, h))
    px = img.load()
    for x in range(w):
        c = lerp(c0, c1, x/(w-1) if w > 1 else 0)
        for y in range(h):
            px[x, y] = c
    return img

def font(size, bold=True):
    cands = [r"C:\Windows\Fonts\segoeuib.ttf", r"C:\Windows\Fonts\arialbd.ttf"] if bold \
        else [r"C:\Windows\Fonts\segoeui.ttf", r"C:\Windows\Fonts\arial.ttf"]
    for c in cands:
        try: return ImageFont.truetype(c, size)
        except Exception: pass
    return ImageFont.load_default()

# base + cheap radial corner tints (cyan top-right, green top-left)
img = Image.new("RGB", (W, H), BG)
px = img.load()
for y in range(H):
    for x in range(W):
        dr = ((x-1020)**2 + (y-30)**2) ** 0.5
        dl = ((x-60)**2 + (y-30)**2) ** 0.5
        cy = max(0, 1 - dr/620) * 0.16
        gr = max(0, 1 - dl/620) * 0.14
        px[x, y] = (min(255, int(BG[0] + CYAN[0]*cy + GREEN[0]*gr)),
                    min(255, int(BG[1] + CYAN[1]*cy + GREEN[1]*gr)),
                    min(255, int(BG[2] + CYAN[2]*cy + GREEN[2]*gr)))
img.paste(hgrad(W, 8, GREEN, CYAN), (0, 0))  # top accent bar
d = ImageDraw.Draw(img)

d.text((80, 128), "PAPER-FIRST · HUMAN-GATED", font=font(22, True), fill=GREEN)
d.text((76, 190), "EAB Paper-Trading", font=font(88, True), fill=INK)

# gradient "Desk"
mf = font(88, True)
bbox = d.textbbox((0, 0), "Desk", font=mf)
mw, mh = bbox[2]-bbox[0], bbox[3]-bbox[1]
mask = Image.new("L", (mw+8, mh+30), 0)
ImageDraw.Draw(mask).text((0, 0), "Desk", font=mf, fill=255)
img.paste(hgrad(mw+8, mh+30, GREEN, CYAN), (78, 300), mask)
d = ImageDraw.Draw(img)

d.text((80, 430), "An autonomous AI quant + daily momentum signals —", font=font(30, False), fill=MUT)
d.text((80, 472), "educational & simulation only, on your own PC.", font=font(30, False), fill=MUT)

def pill(x, w, label):
    d.rounded_rectangle([x, 540, x+w, 584], radius=22, fill=PANEL, outline=LINE)
    bb = d.textbbox((0, 0), label, font=font(20, False))
    d.text((x + (w-(bb[2]-bb[0]))//2, 552), label, font=font(20, False), fill=MUT)

pill(80, 232, "Paper / simulation only")
pill(326, 200, "Daily signal digest")
pill(548, 230, "Not financial advice")

img.save("og.png", "PNG")
print("wrote og.png", img.size)
