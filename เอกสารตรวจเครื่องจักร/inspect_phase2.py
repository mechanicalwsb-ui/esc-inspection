import pymupdf
import sys
import json
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

root = Path(r"C:\Users\autocad06\OneDrive - easternsugar.co.th\02.OneDriver วิศวกรรมจักรกล\06.AI Projects\260925 ตรวจเช็คเครื่องจักรออนไลน์\เอกสารตรวจเครื่องจักร")
base_folder = root / "แบบฟอร์มหลัก"

files = [
    "FM-ML01-ML-05 Rev.00 แบบบันทึกการลดรอบลูกหีบ.pdf",
    "FM-ML01-ML-06 Rev.00 แบบบันทึกการหยุดหีบ.pdf",
    "FM-PD01-PD-01 Rev.00 บันทึกการหยุดหีบ.pdf"
]

for fname in files:
    pdf_path = base_folder / fname
    doc = pymupdf.open(pdf_path)
    print(f"\n=======================================================")
    print(f"FILE: {fname}")
    print(f"Pages: {len(doc)}")
    p = doc[0]
    print(f"Rect: {p.rect.width} x {p.rect.height}")
    
    # Extract drawings (lines / rectangles) to find table boundaries
    paths = p.get_drawings()
    h_lines = []
    v_lines = []
    rects = []
    for item in paths:
        for it in item["items"]:
            if it[0] == "l": # line
                p1, p2 = it[1], it[2]
                if abs(p1.y - p2.y) < 1: # horizontal
                    h_lines.append((min(p1.x, p2.x), max(p1.x, p2.x), p1.y))
                elif abs(p1.x - p2.x) < 1: # vertical
                    v_lines.append((min(p1.y, p2.y), max(p1.y, p2.y), p1.x))
            elif it[0] == "re": # rect
                rect = it[1]
                rects.append(rect)
                
    # Sort and find unique coords
    y_coords = sorted(list(set(round(y, 1) for _, _, y in h_lines)))
    x_coords = sorted(list(set(round(x, 1) for _, _, x in v_lines)))
    
    print(f"Found {len(h_lines)} h-lines, {len(v_lines)} v-lines, {len(rects)} rects")
    print(f"Distinct H-lines Y (first 10): {y_coords[:10]}")
    print(f"Distinct H-lines Y (last 10): {y_coords[-10:]}")
    print(f"Distinct V-lines X: {x_coords}")
    
    # Text blocks
    blocks = p.get_text("blocks")
    print("\n--- TEXT BLOCKS ---")
    for b in sorted(blocks, key=lambda x: (x[1], x[0])):
        text = b[4].strip().replace("\n", " ")
        if text:
            print(f"  [{b[0]:.1f}, {b[1]:.1f}, {b[2]:.1f}, {b[3]:.1f}]: {text}")
