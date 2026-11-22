import os
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

BRAIN_DIR = "/Users/skarifahmed/.gemini/antigravity/brain/c8b7009b-d510-4d67-847d-ce23023a07bb"
DEST_DIR = "/Users/skarifahmed/Documents/Files/codes/beenext/public/images/purchase/topic-samples"

FONT_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
FONT_REG = "/System/Library/Fonts/Supplemental/Arial.ttf"
FONT_BLACK = "/System/Library/Fonts/Supplemental/Arial Black.ttf"

def draw_hashing_diagram(draw, cx, cy):
    font_sub = ImageFont.truetype(FONT_REG, 14)
    font_code = ImageFont.truetype(FONT_BOLD, 15)
    
    # Hash Function box
    h_box = [cx - 150, cy, cx - 30, cy + 36]
    draw.rounded_rectangle(h_box, radius=6, outline=(225, 29, 72), width=2, fill=(255, 241, 242))
    draw.text((cx - 138, cy + 9), "h(k) = k % m", font=font_code, fill=(225, 29, 72))
    
    # Arrow ->
    draw.line([(cx - 25, cy + 18), (cx + 15, cy + 18)], fill=(24, 24, 27), width=2)
    draw.polygon([(cx + 15, cy + 14), (cx + 25, cy + 18), (cx + 15, cy + 22)], fill=(24, 24, 27))
    
    # Array Buckets [0], [1], [2], [3]
    for idx, by in enumerate(range(cy - 12, cy + 70, 22)):
        b_rect = [cx + 30, by, cx + 78, by + 19]
        draw.rectangle(b_rect, outline=(24, 24, 27), width=1, fill=(248, 248, 250))
        draw.text((cx + 38, by + 2), f"[{idx}]", font=font_sub, fill=(24, 24, 27))
        if idx == 1:
            draw.line([(cx + 78, by + 9), (cx + 105, by + 9)], fill=(225, 29, 72), width=2)
            draw.rounded_rectangle([cx + 105, by - 2, cx + 170, by + 21], radius=4, outline=(225, 29, 72), width=2, fill=(255, 255, 255))
            draw.text((cx + 112, by + 2), "Node 1", font=font_sub, fill=(225, 29, 72))

def draw_binary_search_diagram(draw, cx, cy):
    font_sub = ImageFont.truetype(FONT_REG, 13)
    font_bold = ImageFont.truetype(FONT_BOLD, 15)
    
    vals = ["2", "5", "8", "12", "16", "23", "38"]
    cell_w = 40
    start_x = cx - (len(vals) * cell_w) // 2
    
    for i, v in enumerate(vals):
        bx = start_x + i * cell_w
        is_mid = (i == 3)
        outline = (225, 29, 72) if is_mid else (30, 30, 35)
        fill_col = (255, 241, 242) if is_mid else (250, 250, 252)
        txt_col = (225, 29, 72) if is_mid else (24, 24, 27)
        
        draw.rectangle([bx, cy, bx + cell_w - 2, cy + 32], outline=outline, width=2 if is_mid else 1, fill=fill_col)
        bbox = draw.textbbox((0, 0), v, font=font_bold)
        tw = bbox[2] - bbox[0]
        draw.text((bx + (cell_w - tw) // 2 - 1, cy + 7), v, font=font_bold, fill=txt_col)
        
        # Pointers
        if i == 0:
            draw.text((bx + 8, cy + 38), "low", font=font_sub, fill=(71, 85, 105))
            draw.line([(bx + 18, cy + 36), (bx + 18, cy + 32)], fill=(71, 85, 105), width=2)
        elif i == 3:
            draw.text((bx + 8, cy + 38), "mid", font=font_bold, fill=(225, 29, 72))
            draw.line([(bx + 18, cy + 36), (bx + 18, cy + 32)], fill=(225, 29, 72), width=2)
        elif i == 6:
            draw.text((bx + 6, cy + 38), "high", font=font_sub, fill=(71, 85, 105))
            draw.line([(bx + 18, cy + 36), (bx + 18, cy + 32)], fill=(71, 85, 105), width=2)

def draw_bit_manipulation_diagram(draw, cx, cy):
    font_code = ImageFont.truetype(FONT_BOLD, 15)
    font_sub = ImageFont.truetype(FONT_REG, 13)
    
    draw.text((cx - 130, cy), "A :", font=font_code, fill=(71, 85, 105))
    draw.text((cx - 80, cy), "0   1   0   1   1   0", font=font_code, fill=(24, 24, 27))
    
    draw.text((cx - 130, cy + 24), "B :", font=font_code, fill=(71, 85, 105))
    draw.text((cx - 80, cy + 24), "0   0   1   1   0   1", font=font_code, fill=(24, 24, 27))
    
    draw.line([(cx - 130, cy + 48), (cx + 120, cy + 48)], fill=(225, 29, 72), width=2)
    
    draw.text((cx - 130, cy + 54), "A & B :", font=font_code, fill=(225, 29, 72))
    draw.text((cx - 80, cy + 54), "0   0   0   1   0   0", font=font_code, fill=(225, 29, 72))

def draw_greedy_diagram(draw, cx, cy):
    font_sub = ImageFont.truetype(FONT_REG, 12)
    font_bold = ImageFont.truetype(FONT_BOLD, 13)
    
    # Timeline
    draw.line([(cx - 140, cy + 10), (cx + 140, cy + 10)], fill=(71, 85, 105), width=2)
    draw.polygon([(cx + 140, cy + 6), (cx + 148, cy + 10), (cx + 140, cy + 14)], fill=(71, 85, 105))
    draw.text((cx + 120, cy + 15), "Time", font=font_sub, fill=(71, 85, 105))
    
    # Interval 1 (Greedy chosen) in RED
    draw.rounded_rectangle([cx - 130, cy + 24, cx - 40, cy + 44], radius=4, outline=(225, 29, 72), width=2, fill=(255, 241, 242))
    draw.text((cx - 110, cy + 27), "Task 1 (Opt)", font=font_bold, fill=(225, 29, 72))
    
    # Interval 2 (Conflicting rejected) in GREY
    draw.rounded_rectangle([cx - 70, cy + 50, cx + 10, cy + 70], radius=4, outline=(148, 163, 184), width=1, fill=(241, 245, 249))
    draw.text((cx - 50, cy + 53), "Task 2 (Skip)", font=font_sub, fill=(100, 116, 139))
    
    # Interval 3 (Greedy chosen) in RED
    draw.rounded_rectangle([cx - 30, cy + 24, cx + 70, cy + 44], radius=4, outline=(225, 29, 72), width=2, fill=(255, 241, 242))
    draw.text((cx - 10, cy + 27), "Task 3 (Opt)", font=font_bold, fill=(225, 29, 72))

def draw_bst_diagram(draw, cx, cy):
    font_node = ImageFont.truetype(FONT_BOLD, 14)
    r = 16
    
    nodes = [
        (cx, cy + 10, "50", False),
        (cx - 60, cy + 50, "30", False),
        (cx + 60, cy + 50, "70", True),
        (cx - 90, cy + 85, "20", False),
        (cx - 30, cy + 85, "40", False),
        (cx + 30, cy + 85, "60", False),
        (cx + 90, cy + 85, "80", True),
    ]
    edges = [(0, 1), (0, 2), (1, 3), (1, 4), (2, 5), (2, 6)]
    
    for u, v in edges:
        x1, y1, _, is_red1 = nodes[u]
        x2, y2, _, is_red2 = nodes[v]
        col = (225, 29, 72) if (is_red1 and is_red2) else (51, 65, 85)
        draw.line([(x1, y1), (x2, y2)], fill=col, width=2)
        
    for x, y, val, is_red in nodes:
        outline = (225, 29, 72) if is_red else (24, 24, 27)
        fill_col = (255, 241, 242) if is_red else (255, 255, 255)
        txt_col = (225, 29, 72) if is_red else (24, 24, 27)
        draw.ellipse([x - r, y - r, x + r, y + r], outline=outline, width=2, fill=fill_col)
        bbox = draw.textbbox((0, 0), val, font=font_node)
        tw = bbox[2] - bbox[0]
        draw.text((x - tw // 2, y - 8), val, font=font_node, fill=txt_col)

def draw_heaps_diagram(draw, cx, cy):
    font_node = ImageFont.truetype(FONT_BOLD, 14)
    font_sub = ImageFont.truetype(FONT_REG, 13)
    r = 16
    
    nodes = [
        (cx, cy + 10, "100", True),
        (cx - 50, cy + 50, "80", False),
        (cx + 50, cy + 50, "90", False),
        (cx - 75, cy + 85, "40", False),
        (cx - 25, cy + 85, "60", False),
    ]
    edges = [(0, 1), (0, 2), (1, 3), (1, 4)]
    
    for u, v in edges:
        x1, y1, _, _ = nodes[u]
        x2, y2, _, _ = nodes[v]
        draw.line([(x1, y1), (x2, y2)], fill=(51, 65, 85), width=2)
        
    for x, y, val, is_red in nodes:
        outline = (225, 29, 72) if is_red else (24, 24, 27)
        fill_col = (255, 241, 242) if is_red else (255, 255, 255)
        txt_col = (225, 29, 72) if is_red else (24, 24, 27)
        draw.ellipse([x - r, y - r, x + r, y + r], outline=outline, width=2, fill=fill_col)
        bbox = draw.textbbox((0, 0), val, font=font_node)
        tw = bbox[2] - bbox[0]
        draw.text((x - tw // 2, y - 8), val, font=font_node, fill=txt_col)

def draw_maths_diagram(draw, cx, cy):
    font_code = ImageFont.truetype(FONT_BOLD, 15)
    font_sub = ImageFont.truetype(FONT_REG, 13)
    
    # Sieve of Eratosthenes primes
    primes = ["2", "3", "5", "7", "11", "13", "17", "19"]
    cell_w = 32
    start_x = cx - (len(primes) * cell_w) // 2
    
    for i, p in enumerate(primes):
        bx = start_x + i * cell_w
        draw.rounded_rectangle([bx, cy, bx + cell_w - 4, cy + 28], radius=4, outline=(225, 29, 72), width=2, fill=(255, 241, 242))
        bbox = draw.textbbox((0, 0), p, font=font_code)
        tw = bbox[2] - bbox[0]
        draw.text((bx + (cell_w - 4 - tw) // 2, cy + 5), p, font=font_code, fill=(225, 29, 72))
        
    # Formulas
    f1 = "gcd(a, b) = gcd(b, a % b)"
    f2 = "O(log(min(a, b)))"
    bbox1 = draw.textbbox((0, 0), f1, font=font_code)
    draw.text((cx - (bbox1[2] - bbox1[0]) // 2, cy + 40), f1, font=font_code, fill=(24, 24, 27))
    bbox2 = draw.textbbox((0, 0), f2, font=font_sub)
    draw.text((cx - (bbox2[2] - bbox2[0]) // 2, cy + 62), f2, font=font_sub, fill=(100, 116, 139))


TASKS = [
    {
        "topic_slug": "hashing",
        "title": "HASHING",
        "sub": "Hash Tables • Chaining • Collision Handling",
        "base_file": "book_sliding_window_2_pointer_1795240582374.jpg",
        "angle": 3.42,
        "cx": 660,
        "cy": 235,
        "inpaint_y": (210, 420),
        "inpaint_x": (480, 840),
        "diagram_fn": draw_hashing_diagram,
        "diagram_y": 305,
    },
    {
        "topic_slug": "binary-search",
        "title": "BINARY SEARCH",
        "sub": "Divide & Conquer • O(log N) Search Space",
        "base_file": "book_graphs_1795240579523.jpg",
        "angle": -8.75,
        "cx": 615,
        "cy": 225,
        "inpaint_y": (200, 410),
        "inpaint_x": (460, 800),
        "diagram_fn": draw_binary_search_diagram,
        "diagram_y": 295,
    },
    {
        "topic_slug": "bit-manipulation",
        "title": "BIT MANIPULATION",
        "sub": "Bitwise Operations • Masking • Binary Logic",
        "base_file": "book_recursion_1795240602622.jpg",
        "angle": 16.24,
        "cx": 655,
        "cy": 225,
        "inpaint_y": (195, 410),
        "inpaint_x": (480, 850),
        "diagram_fn": draw_bit_manipulation_diagram,
        "diagram_y": 295,
    },
    {
        "topic_slug": "greedy-algorithms",
        "title": "GREEDY ALGORITHMS",
        "sub": "Optimal Substructure • Interval Scheduling",
        "base_file": "book_strings_advanced_algo_1795240641266.jpg",
        "angle": 6.84,
        "cx": 635,
        "cy": 245,
        "inpaint_y": (220, 430),
        "inpaint_x": (460, 820),
        "diagram_fn": draw_greedy_diagram,
        "diagram_y": 315,
    },
    {
        "topic_slug": "binary-search-trees",
        "title": "BINARY SEARCH TREES",
        "sub": "BST Property • Left < Root < Right • Inorder",
        "base_file": "book_linked_list_1795240621049.jpg",
        "angle": 8.89,
        "cx": 665,
        "cy": 225,
        "inpaint_y": (200, 430),
        "inpaint_x": (480, 860),
        "diagram_fn": draw_bst_diagram,
        "diagram_y": 295,
    },
    {
        "topic_slug": "heaps",
        "title": "HEAPS",
        "sub": "Min & Max Heaps • Priority Queues • Tree Structure",
        "base_file": "book_sorting_1795240604714.jpg",
        "angle": -34.21,
        "cx": 625,
        "cy": 220,
        "inpaint_y": (190, 410),
        "inpaint_x": (450, 810),
        "diagram_fn": draw_heaps_diagram,
        "diagram_y": 290,
    },
    {
        "topic_slug": "maths",
        "title": "MATHS",
        "sub": "Number Theory • Prime Sieve • GCD & Modulo",
        "base_file": "book_arrays_1795240622887.jpg",
        "angle": -26.08,
        "cx": 650,
        "cy": 215,
        "inpaint_y": (180, 410),
        "inpaint_x": (470, 840),
        "diagram_fn": draw_maths_diagram,
        "diagram_y": 285,
    },
]

def generate():
    font_title = ImageFont.truetype(FONT_BOLD, 38)
    font_sub = ImageFont.truetype(FONT_REG, 15)
    
    for t in TASKS:
        src_path = os.path.join(BRAIN_DIR, t["base_file"])
        orig = cv2.imread(src_path)
        h, w = orig.shape[:2]
        center = (w // 2, h // 2)
        ang = t["angle"]
        
        # 1. Rotate to horizontal
        M = cv2.getRotationMatrix2D(center, ang, 1.0)
        M_inv = cv2.getRotationMatrix2D(center, -ang, 1.0)
        rot = cv2.warpAffine(orig, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
        
        # 2. Inpaint region
        y1, y2 = t["inpaint_y"]
        x1, x2 = t["inpaint_x"]
        gray = cv2.cvtColor(rot, cv2.COLOR_BGR2GRAY)
        mask = np.zeros((h, w), dtype=np.uint8)
        
        sub_gray = gray[y1:y2, x1:x2]
        # Inpaint dark and colored pixels in cover text area
        sub_mask = ((sub_gray < 175) | (rot[y1:y2, x1:x2, 2] > 175)).astype(np.uint8) * 255
        sub_mask = cv2.dilate(sub_mask, np.ones((5, 5), np.uint8), iterations=2)
        mask[y1:y2, x1:x2] = sub_mask
        
        inp = cv2.inpaint(rot, mask, inpaintRadius=7, flags=cv2.INPAINT_TELEA)
        
        # 3. Draw new Title, Red Bar, Subtitle, and Diagram
        im_pil = Image.fromarray(cv2.cvtColor(inp, cv2.COLOR_BGR2RGB))
        draw = ImageDraw.Draw(im_pil)
        
        # Title
        title_text = t["title"]
        bbox = draw.textbbox((0, 0), title_text, font=font_title)
        tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
        tx = t["cx"] - tw // 2
        ty = t["cy"]
        draw.text((tx, ty), title_text, font=font_title, fill=(24, 24, 27))
        
        # Red bar
        draw.rectangle([tx, ty + th + 6, tx + tw, ty + th + 10], fill=(225, 29, 72))
        
        # Subtitle
        sub_text = t["sub"]
        bbox_sub = draw.textbbox((0, 0), sub_text, font=font_sub)
        sw, sh = bbox_sub[2] - bbox_sub[0], bbox_sub[3] - bbox_sub[1]
        draw.text((t["cx"] - sw // 2, ty + th + 16), sub_text, font=font_sub, fill=(100, 116, 139))
        
        # Diagram
        t["diagram_fn"](draw, t["cx"], t["diagram_y"])
        
        # 4. Warp back to original orientation
        modified_rot = cv2.cvtColor(np.array(im_pil), cv2.COLOR_RGB2BGR)
        
        # Blend patch smoothly using Gaussian blur mask
        patch_mask = np.zeros((h, w), dtype=np.float32)
        patch_mask[y1:y2, x1:x2] = 1.0
        patch_mask = cv2.GaussianBlur(patch_mask, (15, 15), 0)
        
        warped_mod = cv2.warpAffine(modified_rot, M_inv, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
        warped_mask = cv2.warpAffine(patch_mask, M_inv, (w, h), flags=cv2.INTER_LINEAR)
        warped_mask_3d = np.repeat(warped_mask[:, :, np.newaxis], 3, axis=2)
        
        final = (orig * (1.0 - warped_mask_3d) + warped_mod * warped_mask_3d).astype(np.uint8)
        
        out_filename = f"{t['topic_slug']}.jpg"
        out_path = os.path.join(DEST_DIR, out_filename)
        cv2.imwrite(out_path, final, [cv2.IMWRITE_JPEG_QUALITY, 95])
        size_kb = os.path.getsize(out_path) // 1024
        print(f"✓ Generated {out_filename:26s} for {t['title']:22s} ({size_kb} KB)")

if __name__ == "__main__":
    generate()
