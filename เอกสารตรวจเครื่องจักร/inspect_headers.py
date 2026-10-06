import pymupdf
import sys

sys.stdout.reconfigure(encoding="utf-8")

for fname, y_max in [
    ("FM-ML01-ML-05 Rev.00 แบบบันทึกการลดรอบลูกหีบ.pdf", 140.0),
    ("FM-ML01-ML-06 Rev.00 แบบบันทึกการหยุดหีบ.pdf", 160.0),
    ("FM-PD01-PD-01 Rev.00 บันทึกการหยุดหีบ.pdf", 160.0)
]:
    doc = pymupdf.open(f"แบบฟอร์มหลัก/{fname}")
    p = doc[0]
    words = p.get_text("words")
    table_words = [w for w in words if w[1] >= 75 and w[3] <= y_max]
    print(f"\n=== {fname} Header Words (Y: 75 to {y_max}) ===")
    for w in sorted(table_words, key=lambda x: (round(x[1], -1), x[0])):
        print(f"  Y=[{w[1]:.1f}..{w[3]:.1f}], X=[{w[0]:.1f}..{w[2]:.1f}] : {w[4]}")
