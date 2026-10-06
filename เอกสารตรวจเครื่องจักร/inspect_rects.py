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
    p = doc[0]
    drawings = p.get_drawings()
    
    h_segments = []
    v_segments = []
    
    for d in drawings:
        for it in d["items"]:
            if it[0] == "re":
                r = it[1]
                if r.height < 2 and r.width > 5: # horizontal thin rect
                    h_segments.append((r.x0, r.x1, (r.y0 + r.y1)/2))
                elif r.width < 2 and r.height > 5: # vertical thin rect
                    v_segments.append(((r.x0 + r.x1)/2, r.y0, r.y1))
            elif it[0] == "l":
                p1, p2 = it[1], it[2]
                if abs(p1.y - p2.y) < 1:
                    h_segments.append((min(p1.x, p2.x), max(p1.x, p2.x), (p1.y + p2.y)/2))
                elif abs(p1.x - p2.x) < 1:
                    v_segments.append(((p1.x + p2.x)/2, min(p1.y, p2.y), max(p1.y, p2.y)))
                    
    # Find table bounding box
    min_x = min(s[0] for s in h_segments)
    max_x = max(s[1] for s in h_segments)
    min_y = min(s[2] for s in h_segments)
    max_y = max(s[2] for s in h_segments)
    
    print(f"\n=======================================================")
    print(f"FILE: {fname}")
    print(f"Table Bounding Box: X [{min_x:.1f} .. {max_x:.1f}], Y [{min_y:.1f} .. {max_y:.1f}]")
    
    # Filter vertical segments inside the table
    v_xs = sorted(list(set(round(s[0], 1) for s in v_segments)))
    # Filter horizontal segments inside the table
    h_ys = sorted(list(set(round(s[2], 1) for s in h_segments)))
    
    # Cluster close values (within 1.5 pt)
    def cluster(values, tol=1.5):
        if not values: return []
        res = [values[0]]
        for v in values[1:]:
            if abs(v - res[-1]) > tol:
                res.append(v)
            else:
                res[-1] = round((res[-1] + v) / 2, 1)
        return res

    v_xs_clustered = cluster(v_xs)
    h_ys_clustered = cluster(h_ys)
    
    print(f"Table Columns X ({len(v_xs_clustered)} lines, {len(v_xs_clustered)-1} cols): {v_xs_clustered}")
    print(f"Table Rows Y ({len(h_ys_clustered)} lines, {len(h_ys_clustered)-1} rows): {h_ys_clustered}")
    if len(h_ys_clustered) > 1:
        row_heights = [round(h_ys_clustered[i+1] - h_ys_clustered[i], 1) for i in range(len(h_ys_clustered)-1)]
        print(f"Row heights: {row_heights}")

