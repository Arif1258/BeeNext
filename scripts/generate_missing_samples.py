import os
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

TOPIC_SAMPLES_DIR = "/Users/skarifahmed/Documents/Files/codes/beenext/public/images/purchase/topic-samples"
ARTIFACTS_DIR = "/Users/skarifahmed/.gemini/antigravity/brain/c8b7009b-d510-4d67-847d-ce23023a07bb"

tasks = [
    {
        "filename": "graphs.jpg",
        "topic_name": "Graphs",
        "base_path": os.path.join(ARTIFACTS_DIR, "tries_notes_1795189962020.jpg"),
        "angle": -14.0,
        "inpaint_box": (375, 445, 520, 745),  # y1, y2, x1, x2 in rotated space
        "text": "GRAPHS",
        "font_size": 44,
        "center": (630, 410),
        "patch_box": (370, 450, 505, 760),
    },
    {
        "filename": "maths.jpg",
        "topic_name": "Maths",
        "base_path": os.path.join(ARTIFACTS_DIR, "beginner_problems_notes_1795190014228.jpg"),
        "angle": -14.0,
        "inpaint_box": (460, 505, 430, 930),
        "text": "MATHS",
        "font_size": 46,
        "center": (640, 485),
        "patch_box": (455, 510, 420, 935),
    },
    {
        "filename": "strings-basic-and-medium.jpg",
        "topic_name": "Strings (Basic and Medium)",
        "base_path": os.path.join(ARTIFACTS_DIR, "binary_trees_notes_1795189926555.jpg"),
        "angle": -14.0,
        "inpaint_box": (455, 515, 440, 880),
        "text": "STRINGS (BASIC AND MEDIUM)",
        "font_size": 25,
        "center": (645, 485),
        "patch_box": (450, 525, 430, 900),
    },
    {
        "filename": "strings-advanced-algo.jpg",
        "topic_name": "Strings (Advanced Algo)",
        "base_path": os.path.join(ARTIFACTS_DIR, "bit_manipulation_notes_1795189983297.jpg"),
        "angle": -14.0,
        "inpaint_box": (450, 508, 435, 930),
        "text": "STRINGS (ADVANCED ALGO)",
        "font_size": 27,
        "center": (655, 480),
        "patch_box": (445, 515, 425, 940),
    },
    {
        "filename": "sliding-window-2-pointer.jpg",
        "topic_name": "Sliding Window / 2 Pointer",
        "base_path": os.path.join(ARTIFACTS_DIR, ".user_uploaded/media_1795189646051_d13f99b5.jpg"),
        "angle": 20.18,
        "inpaint_box": (360, 402, 350, 725),
        "text": "SLIDING WINDOW / 2 POINTER",
        "font_size": 22,
        "center": (520, 382),
        "patch_box": (355, 407, 340, 735),
    },
]

def generate_samples():
    print("Generating exact corrected topic sample images...")
    font_path = "/System/Library/Fonts/Supplemental/Arial Rounded Bold.ttf"

    for t in tasks:
        orig = cv2.imread(t["base_path"])
        h, w = orig.shape[:2]
        center = (w // 2, h // 2)
        angle = t["angle"]
        
        # 1. Rotate to horizontal
        M = cv2.getRotationMatrix2D(center, angle, 1.0)
        M_inv = cv2.getRotationMatrix2D(center, -angle, 1.0)
        rot = cv2.warpAffine(orig, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
        
        # 2. Inpaint in rotated space
        y1, y2, x1, x2 = t["inpaint_box"]
        gray_rot = cv2.cvtColor(rot, cv2.COLOR_BGR2GRAY)
        mask_rot = np.zeros((h, w), dtype=np.uint8)
        dark = (gray_rot[y1:y2, x1:x2] < 155).astype(np.uint8) * 255
        mask_rot[y1:y2, x1:x2] = dark
        mask_rot = cv2.dilate(mask_rot, np.ones((5,5), np.uint8), iterations=2)
        inpaint_rot = cv2.inpaint(rot, mask_rot, inpaintRadius=5, flags=cv2.INPAINT_TELEA)
        
        # 3. Draw text in rotated space
        im_pil = Image.fromarray(cv2.cvtColor(inpaint_rot, cv2.COLOR_BGR2RGB))
        draw = ImageDraw.Draw(im_pil)
        font = ImageFont.truetype(font_path, t["font_size"])
        
        bbox = draw.textbbox((0, 0), t["text"], font=font)
        tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
        cx, cy = t["center"]
        tx = cx - tw // 2
        ty = cy - th // 2
        ink_color = (48, 50, 56)
        draw.text((tx, ty), t["text"], font=font, fill=ink_color)
        
        # 4. Warp back to original space
        modified_rot = cv2.cvtColor(np.array(im_pil), cv2.COLOR_RGB2BGR)
        warped_back = cv2.warpAffine(modified_rot, M_inv, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
        
        # 5. Blend patch
        py1, py2, px1, px2 = t["patch_box"]
        patch_mask_rot = np.zeros((h, w), dtype=np.float32)
        patch_mask_rot[py1:py2, px1:px2] = 1.0
        patch_mask_rot = cv2.GaussianBlur(patch_mask_rot, (11, 11), 0)
        patch_mask_orig = cv2.warpAffine(patch_mask_rot, M_inv, (w, h), flags=cv2.INTER_LINEAR)
        patch_mask_3d = np.repeat(patch_mask_orig[:, :, np.newaxis], 3, axis=2)
        
        final = (orig * (1.0 - patch_mask_3d) + warped_back * patch_mask_3d).astype(np.uint8)
        
        out_path = os.path.join(TOPIC_SAMPLES_DIR, t["filename"])
        cv2.imwrite(out_path, final, [cv2.IMWRITE_JPEG_QUALITY, 95])
        size_kb = os.path.getsize(out_path) // 1024
        print(f"✓ Saved {t['filename']} ({t['topic_name']}) -> {t['text']} [{size_kb} KB]")

if __name__ == "__main__":
    generate_samples()
