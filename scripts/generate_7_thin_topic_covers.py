import os
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

FONT_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
FONT_REG = "/System/Library/Fonts/Supplemental/Arial.ttf"
FONT_BLACK = "/System/Library/Fonts/Supplemental/Arial Black.ttf"

def draw_hashing_cover(draw, cov_w, cov_h):
    font_code = ImageFont.truetype(FONT_BOLD, 36)
    font_cell = ImageFont.truetype(FONT_BOLD, 30)
    
    cx, cy = cov_w // 2, 880
    # Hash function box:
    h_box = [cx - 420, cy - 80, cx - 120, cy + 30]
    draw.rounded_rectangle(h_box, radius=14, outline=(225, 29, 72), width=4, fill=(255, 241, 242))
    draw.text((cx - 395, cy - 42), "hash(key) % m", font=font_code, fill=(225, 29, 72))

    # Arrow
    draw.line([(cx - 120, cy - 25), (cx + 25, cy - 25)], fill=(24, 24, 27), width=4)
    draw.polygon([(cx + 25, cy - 37), (cx + 50, cy - 25), (cx + 25, cy - 13)], fill=(24, 24, 27))

    # Buckets
    for idx, by in enumerate(range(cy - 230, cy + 240, 78)):
        b_rect = [cx + 55, by, cx + 210, by + 62]
        draw.rounded_rectangle(b_rect, radius=8, outline=(24, 24, 27), width=3, fill=(248, 248, 250))
        draw.text((cx + 95, by + 14), f"[{idx}]", font=font_cell, fill=(24, 24, 27))
        if idx == 2:
            draw.line([(cx + 210, by + 31), (cx + 310, by + 31)], fill=(225, 29, 72), width=3)
            draw.polygon([(cx + 310, by + 22), (cx + 330, by + 31), (cx + 310, by + 40)], fill=(225, 29, 72))
            node_rect = [cx + 330, by - 8, cx + 560, by + 70]
            draw.rounded_rectangle(node_rect, radius=10, outline=(225, 29, 72), width=3, fill=(255, 241, 242))
            draw.text((cx + 350, by + 14), "Node(key, val)", font=font_cell, fill=(225, 29, 72))

def draw_binary_search_cover(draw, cov_w, cov_h):
    font_bold = ImageFont.truetype(FONT_BOLD, 36)
    font_sub = ImageFont.truetype(FONT_REG, 28)
    font_code = ImageFont.truetype(FONT_BOLD, 32)
    
    vals = ["2", "5", "8", "12", "16", "23", "38"]
    cell_w = 110
    start_x = (cov_w - len(vals) * cell_w) // 2
    cy = 820
    
    for i, v in enumerate(vals):
        bx = start_x + i * cell_w
        is_mid = (i == 3)
        outline = (225, 29, 72) if is_mid else (30, 30, 35)
        fill_col = (255, 241, 242) if is_mid else (250, 250, 252)
        txt_col = (225, 29, 72) if is_mid else (24, 24, 27)
        
        draw.rounded_rectangle([bx, cy, bx + cell_w - 6, cy + 90], radius=8, outline=outline, width=4 if is_mid else 3, fill=fill_col)
        bbox = draw.textbbox((0, 0), v, font=font_bold)
        tw = bbox[2] - bbox[0]
        draw.text((bx + (cell_w - 6 - tw) // 2, cy + 24), v, font=font_bold, fill=txt_col)
        
        # Pointers
        if i == 0:
            draw.text((bx + 18, cy + 110), "low (0)", font=font_sub, fill=(71, 85, 105))
            draw.line([(bx + 52, cy + 105), (bx + 52, cy + 92)], fill=(71, 85, 105), width=3)
        elif i == 3:
            draw.text((bx + 10, cy + 110), "mid = (L+H)/2", font=font_bold, fill=(225, 29, 72))
            draw.line([(bx + 52, cy + 105), (bx + 52, cy + 92)], fill=(225, 29, 72), width=4)
        elif i == 6:
            draw.text((bx + 16, cy + 110), "high (6)", font=font_sub, fill=(71, 85, 105))
            draw.line([(bx + 52, cy + 105), (bx + 52, cy + 92)], fill=(71, 85, 105), width=3)
            
    # Search logic formula
    f_text = "if (arr[mid] == target) return mid;  // O(log N)"
    bbox_f = draw.textbbox((0, 0), f_text, font=font_code)
    draw.text(((cov_w - (bbox_f[2] - bbox_f[0])) // 2, cy + 180), f_text, font=font_code, fill=(24, 24, 27))

def draw_bit_manipulation_cover(draw, cov_w, cov_h):
    font_code = ImageFont.truetype(FONT_BOLD, 36)
    font_sub = ImageFont.truetype(FONT_REG, 30)
    
    cx, cy = cov_w // 2, 760
    
    draw.text((cx - 360, cy), "Operand A :", font=font_code, fill=(71, 85, 105))
    draw.text((cx - 80, cy), "0   1   0   1   1   0   (22)", font=font_code, fill=(24, 24, 27))
    
    draw.text((cx - 360, cy + 60), "Operand B :", font=font_code, fill=(71, 85, 105))
    draw.text((cx - 80, cy + 60), "0   0   1   1   0   1   (13)", font=font_code, fill=(24, 24, 27))
    
    draw.line([(cx - 360, cy + 120), (cx + 360, cy + 120)], fill=(225, 29, 72), width=4)
    
    draw.text((cx - 360, cy + 145), "A & B (AND) :", font=font_code, fill=(225, 29, 72))
    draw.text((cx - 80, cy + 145), "0   0   0   1   0   0   (4)", font=font_code, fill=(225, 29, 72))
    
    draw.text((cx - 360, cy + 205), "A ^ B (XOR) :", font=font_code, fill=(24, 24, 27))
    draw.text((cx - 80, cy + 205), "0   1   1   0   1   1   (27)", font=font_code, fill=(24, 24, 27))
    
    # Bitmask box below
    box_w = [cx - 360, cy + 280, cx + 360, cy + 345]
    draw.rounded_rectangle(box_w, radius=10, outline=(225, 29, 72), width=3, fill=(255, 241, 242))
    draw.text((cx - 330, cy + 295), "Check k-th bit: (n >> k) & 1   •   Set bit: n | (1 << k)", font=font_sub, fill=(225, 29, 72))

def draw_greedy_cover(draw, cov_w, cov_h):
    font_bold = ImageFont.truetype(FONT_BOLD, 28)
    font_sub = ImageFont.truetype(FONT_REG, 26)
    
    cx, cy = cov_w // 2, 780
    
    # Time Axis
    draw.line([(cx - 400, cy), (cx + 400, cy)], fill=(71, 85, 105), width=4)
    draw.polygon([(cx + 400, cy - 8), (cx + 420, cy), (cx + 400, cy + 8)], fill=(71, 85, 105))
    draw.text((cx + 360, cy + 14), "Time →", font=font_sub, fill=(71, 85, 105))
    
    # Interval 1 (Accepted - Red)
    draw.rounded_rectangle([cx - 380, cy + 35, cx - 140, cy + 90], radius=8, outline=(225, 29, 72), width=3, fill=(255, 241, 242))
    draw.text((cx - 330, cy + 48), "✓ Task 1 [1 - 4]", font=font_bold, fill=(225, 29, 72))
    
    # Interval 2 (Rejected - Grey Conflict)
    draw.rounded_rectangle([cx - 220, cy + 110, cx + 20, cy + 165], radius=8, outline=(148, 163, 184), width=2, fill=(241, 245, 249))
    draw.text((cx - 170, cy + 124), "✗ Task 2 (Conflict)", font=font_sub, fill=(100, 116, 139))
    
    # Interval 3 (Accepted - Red)
    draw.rounded_rectangle([cx - 100, cy + 35, cx + 160, cy + 90], radius=8, outline=(225, 29, 72), width=3, fill=(255, 241, 242))
    draw.text((cx - 50, cy + 48), "✓ Task 3 [5 - 7]", font=font_bold, fill=(225, 29, 72))
    
    # Interval 4 (Accepted - Red)
    draw.rounded_rectangle([cx + 180, cy + 35, cx + 380, cy + 90], radius=8, outline=(225, 29, 72), width=3, fill=(255, 241, 242))
    draw.text((cx + 210, cy + 48), "✓ Task 4 [8 - 10]", font=font_bold, fill=(225, 29, 72))
    
    # Formula below
    draw.text((cx - 330, cy + 210), "Greedy Choice: Sort by finish time • Maximum non-overlapping set", font=font_sub, fill=(24, 24, 27))

def draw_bst_cover(draw, cov_w, cov_h):
    font_node = ImageFont.truetype(FONT_BOLD, 30)
    font_sub = ImageFont.truetype(FONT_REG, 28)
    r = 36
    cx, cy = cov_w // 2, 730
    
    nodes = [
        (cx, cy, "50", False),
        (cx - 160, cy + 100, "30", False),
        (cx + 160, cy + 100, "70", True),
        (cx - 240, cy + 200, "20", False),
        (cx - 80, cy + 200, "40", False),
        (cx + 80, cy + 200, "60", False),
        (cx + 240, cy + 200, "80", True),
    ]
    edges = [(0, 1), (0, 2), (1, 3), (1, 4), (2, 5), (2, 6)]
    
    for u, v in edges:
        x1, y1, _, is_red1 = nodes[u]
        x2, y2, _, is_red2 = nodes[v]
        col = (225, 29, 72) if (is_red1 and is_red2) else (71, 85, 105)
        width = 4 if (is_red1 and is_red2) else 3
        draw.line([(x1, y1), (x2, y2)], fill=col, width=width)
        
    for x, y, val, is_red in nodes:
        outline = (225, 29, 72) if is_red else (24, 24, 27)
        fill_col = (255, 241, 242) if is_red else (255, 255, 255)
        txt_col = (225, 29, 72) if is_red else (24, 24, 27)
        draw.ellipse([x - r, y - r, x + r, y + r], outline=outline, width=3, fill=fill_col)
        bbox = draw.textbbox((0, 0), val, font=font_node)
        tw = bbox[2] - bbox[0]
        draw.text((x - tw // 2, y - 18), val, font=font_node, fill=txt_col)
        
    # Legend
    draw.text((cx - 300, cy + 270), "BST Invariant: Left Subtree < Root < Right Subtree", font=font_sub, fill=(225, 29, 72))

def draw_heaps_cover(draw, cov_w, cov_h):
    font_node = ImageFont.truetype(FONT_BOLD, 28)
    font_arr = ImageFont.truetype(FONT_BOLD, 26)
    font_sub = ImageFont.truetype(FONT_REG, 26)
    r = 32
    cx, cy = cov_w // 2, 700
    
    nodes = [
        (cx, cy, "100", True),
        (cx - 140, cy + 90, "80", False),
        (cx + 140, cy + 90, "90", False),
        (cx - 200, cy + 180, "40", False),
        (cx - 80, cy + 180, "60", False),
        (cx + 80, cy + 180, "70", False),
    ]
    edges = [(0, 1), (0, 2), (1, 3), (1, 4), (2, 5)]
    
    for u, v in edges:
        x1, y1, _, _ = nodes[u]
        x2, y2, _, _ = nodes[v]
        draw.line([(x1, y1), (x2, y2)], fill=(71, 85, 105), width=3)
        
    for x, y, val, is_red in nodes:
        outline = (225, 29, 72) if is_red else (24, 24, 27)
        fill_col = (255, 241, 242) if is_red else (255, 255, 255)
        txt_col = (225, 29, 72) if is_red else (24, 24, 27)
        draw.ellipse([x - r, y - r, x + r, y + r], outline=outline, width=3, fill=fill_col)
        bbox = draw.textbbox((0, 0), val, font=font_node)
        tw = bbox[2] - bbox[0]
        draw.text((x - tw // 2, y - 16), val, font=font_node, fill=txt_col)
        
    # Array representation below
    arr_y = cy + 240
    arr_vals = ["100", "80", "90", "40", "60", "70"]
    cell_w = 90
    ax_start = (cov_w - len(arr_vals) * cell_w) // 2
    for i, v in enumerate(arr_vals):
        bx = ax_start + i * cell_w
        is_max = (i == 0)
        draw.rectangle([bx, arr_y, bx + cell_w - 4, arr_y + 55], outline=(225, 29, 72) if is_max else (24, 24, 27), width=3, fill=(255, 241, 242) if is_max else (250, 250, 252))
        bbox = draw.textbbox((0, 0), v, font=font_arr)
        draw.text((bx + (cell_w - 4 - (bbox[2] - bbox[0])) // 2, arr_y + 12), v, font=font_arr, fill=(225, 29, 72) if is_max else (24, 24, 27))
        draw.text((bx + cell_w // 2 - 8, arr_y + 64), f"[{i}]", font=font_sub, fill=(100, 116, 139))

def draw_maths_cover(draw, cov_w, cov_h):
    font_prime = ImageFont.truetype(FONT_BOLD, 28)
    font_code = ImageFont.truetype(FONT_BOLD, 32)
    font_sub = ImageFont.truetype(FONT_REG, 28)
    
    cx, cy = cov_w // 2, 730
    
    # Prime Sieve cells
    primes = ["2", "3", "5", "7", "11", "13", "17", "19", "23", "29"]
    cell_w = 70
    start_x = (cov_w - len(primes) * cell_w) // 2
    
    draw.text((start_x, cy - 45), "Prime Sieve (Sieve of Eratosthenes):", font=font_sub, fill=(71, 85, 105))
    for i, p in enumerate(primes):
        bx = start_x + i * cell_w
        draw.rounded_rectangle([bx, cy, bx + cell_w - 6, cy + 55], radius=6, outline=(225, 29, 72), width=3, fill=(255, 241, 242))
        bbox = draw.textbbox((0, 0), p, font=font_prime)
        tw = bbox[2] - bbox[0]
        draw.text((bx + (cell_w - 6 - tw) // 2, cy + 12), p, font=font_prime, fill=(225, 29, 72))
        
    # Formulas
    f1 = "gcd(a, b) = gcd(b, a % b)   // O(log(min(a, b)))"
    f2 = "(a * b) % m = ((a % m) * (b % m)) % m"
    f3 = "Prime Factorization: N = p1^a1 • p2^a2 • ... • pk^ak"
    
    bbox1 = draw.textbbox((0, 0), f1, font=font_code)
    draw.text(((cov_w - (bbox1[2] - bbox1[0])) // 2, cy + 100), f1, font=font_code, fill=(24, 24, 27))
    
    bbox2 = draw.textbbox((0, 0), f2, font=font_sub)
    draw.text(((cov_w - (bbox2[2] - bbox2[0])) // 2, cy + 160), f2, font=font_sub, fill=(100, 116, 139))
    
    bbox3 = draw.textbbox((0, 0), f3, font=font_sub)
    draw.text(((cov_w - (bbox3[2] - bbox3[0])) // 2, cy + 215), f3, font=font_sub, fill=(225, 29, 72))

TARGET_TOPICS = [
    {
        "slug": "hashing",
        "title": "HASHING",
        "sub1": "DSA Solutions & Analysis • Brute Force & Optimal",
        "sub2": "Hash Tables • Collision Handling • Chaining & Probing",
        "draw_fn": draw_hashing_cover,
    },
    {
        "slug": "binary-search",
        "title": "BINARY SEARCH",
        "sub1": "DSA Solutions & Analysis • Brute Force & Optimal",
        "sub2": "Divide & Conquer • Search Space Reduction • O(log N)",
        "draw_fn": draw_binary_search_cover,
    },
    {
        "slug": "bit-manipulation",
        "title": "BIT MANIPULATION",
        "sub1": "DSA Solutions & Analysis • Brute Force & Optimal",
        "sub2": "Bitwise Operators • Bitmasking • Binary Logic",
        "draw_fn": draw_bit_manipulation_cover,
    },
    {
        "slug": "greedy-algorithms",
        "title": "GREEDY ALGORITHMS",
        "sub1": "DSA Solutions & Analysis • Brute Force & Optimal",
        "sub2": "Optimal Substructure • Interval Scheduling • Activity Selection",
        "draw_fn": draw_greedy_cover,
    },
    {
        "slug": "binary-search-trees",
        "title": "BINARY SEARCH TREES",
        "sub1": "DSA Solutions & Analysis • Brute Force & Optimal",
        "sub2": "BST Property: Left < Root < Right • Inorder Traversal",
        "draw_fn": draw_bst_cover,
    },
    {
        "slug": "heaps",
        "title": "HEAPS",
        "sub1": "DSA Solutions & Analysis • Brute Force & Optimal",
        "sub2": "Priority Queues • Complete Binary Tree • Heapify O(log N)",
        "draw_fn": draw_heaps_cover,
    },
    {
        "slug": "maths",
        "title": "MATHS",
        "sub1": "DSA Solutions & Analysis • Brute Force & Optimal",
        "sub2": "Number Theory • Sieve of Eratosthenes • Euclidean GCD",
        "draw_fn": draw_maths_cover,
    },
]

def render_flat_cover(topic, cov_w=1400, cov_h=1400):
    cover = Image.new("RGB", (cov_w, cov_h), (253, 253, 254))
    draw = ImageDraw.Draw(cover)
    
    font_logo = ImageFont.truetype(FONT_BOLD, 76)
    font_title = ImageFont.truetype(FONT_BLACK, 104)
    font_sub1 = ImageFont.truetype(FONT_BOLD, 38)
    font_sub2 = ImageFont.truetype(FONT_REG, 34)
    
    # BeeNext Logo
    draw.text((150, 140), "Bee", font=font_logo, fill=(24, 24, 27))
    draw.text((300, 140), "Next", font=font_logo, fill=(225, 29, 72))
    
    # Title
    draw.text((150, 275), topic["title"], font=font_title, fill=(24, 24, 27))
    bbox_t = draw.textbbox((150, 275), topic["title"], font=font_title)
    
    # Red accent bar
    draw.rectangle([150, bbox_t[3] + 18, 150 + (bbox_t[2] - bbox_t[0]), bbox_t[3] + 30], fill=(225, 29, 72))
    
    # Subtitles
    draw.text((150, bbox_t[3] + 55), topic["sub1"], font=font_sub1, fill=(71, 85, 105))
    draw.text((150, bbox_t[3] + 105), topic["sub2"], font=font_sub2, fill=(100, 116, 139))
    
    # Topic specific diagram
    topic["draw_fn"](draw, cov_w, cov_h)
    
    return cv2.cvtColor(np.array(cover), cv2.COLOR_RGB2BGR)

def render_thin_book(base_img_path, topic, out_path):
    im = cv2.imread(base_img_path)
    h, w, _ = im.shape

    p_left = np.array([165, 358], dtype=np.float32)
    p_top = np.array([660, 195], dtype=np.float32)
    p_right = np.array([1070, 446], dtype=np.float32)
    p_bot = np.array([600, 639], dtype=np.float32)

    THICK = 15

    # 1. Inpaint lower thick spine and pages from table
    mask_thick = np.zeros((h, w), dtype=np.uint8)
    for x in range(165, 1070):
        if x <= 600:
            t = (x - 165) / (600 - 165)
            y_cov = int(p_left[1] + t * (p_bot[1] - p_left[1]))
            y_orig_bot = int(456 + t * (686 - 456))
        else:
            t = (x - 600) / (1070 - 600)
            y_cov = int(p_bot[1] + t * (p_right[1] - p_bot[1]))
            y_orig_bot = int(686 + t * (505 - 686))
        
        y_new = y_cov + THICK
        if y_orig_bot > y_new:
            mask_thick[y_new:y_orig_bot + 4, x] = 255

    thinned_bg = cv2.inpaint(im, mask_thick, inpaintRadius=8, flags=cv2.INPAINT_TELEA)

    # 2. Contact shadow
    shadow = np.zeros((h, w), dtype=np.float32)
    for x in range(165, 1070):
        if x <= 600:
            t = (x - 165) / (600 - 165)
            y_cov = int(p_left[1] + t * (p_bot[1] - p_left[1]))
        else:
            t = (x - 600) / (1070 - 600)
            y_cov = int(p_bot[1] + t * (p_right[1] - p_bot[1]))
        y_new = y_cov + THICK
        shadow[y_new:y_new + 14, x] = 0.50

    shadow = cv2.GaussianBlur(shadow, (7, 7), 0)
    thinned_bg = (thinned_bg.astype(np.float32) * (1.0 - shadow[:, :, np.newaxis])).astype(np.uint8)

    # 3. Thin spine & pages
    spine_poly = np.int32([p_left, p_bot, p_bot + [0, THICK], p_left + [0, THICK]])
    pages_poly = np.int32([p_bot, p_right, p_right + [0, THICK], p_bot + [0, THICK]])

    cv2.fillConvexPoly(thinned_bg, spine_poly, (232, 232, 235))
    cv2.line(thinned_bg, tuple(np.int32(p_left + [0, THICK])), tuple(np.int32(p_bot + [0, THICK])), (140, 140, 145), 1)

    cv2.fillConvexPoly(thinned_bg, pages_poly, (240, 240, 242))
    cv2.line(thinned_bg, tuple(np.int32(p_bot + [0, THICK/2])), tuple(np.int32(p_right + [0, THICK/2])), (215, 215, 218), 1)
    cv2.line(thinned_bg, tuple(np.int32(p_bot + [0, THICK])), tuple(np.int32(p_right + [0, THICK])), (150, 150, 155), 1)

    # 4. Render flat cover
    cov_w, cov_h = 1400, 1400
    cover_bgr = render_flat_cover(topic, cov_w, cov_h)

    # 5. Perspective warp
    src_quad = np.array([[0, 0], [cov_w, 0], [cov_w, cov_h], [0, cov_h]], dtype=np.float32)
    dst_quad = np.array([p_left, p_top, p_right, p_bot], dtype=np.float32)

    M = cv2.getPerspectiveTransform(src_quad, dst_quad)
    warped_cov = cv2.warpPerspective(cover_bgr, M, (w, h), flags=cv2.INTER_CUBIC)

    cover_mask = np.zeros((h, w), dtype=np.uint8)
    cv2.fillConvexPoly(cover_mask, np.int32([p_left, p_top, p_right, p_bot]), 255)
    cover_mask_f = cv2.GaussianBlur(cover_mask.astype(np.float32)/255.0, (3, 3), 0)[:, :, np.newaxis]

    final = (thinned_bg.astype(np.float32) * (1.0 - cover_mask_f) + warped_cov.astype(np.float32) * cover_mask_f).astype(np.uint8)

    cv2.imwrite(out_path, final, [cv2.IMWRITE_JPEG_QUALITY, 95])
    print(f"✓ Generated thin book for {topic['title']:24s} -> {out_path}")

if __name__ == "__main__":
    base_path = "/Users/skarifahmed/.gemini/antigravity/brain/c8b7009b-d510-4d67-847d-ce23023a07bb/book_sorting_1795240604714.jpg"
    dest_dir = "/Users/skarifahmed/Documents/Files/codes/beenext/public/images/purchase/topic-samples"
    
    for t in TARGET_TOPICS:
        out_f = os.path.join(dest_dir, f"{t['slug']}.jpg")
        render_thin_book(base_path, t, out_f)
