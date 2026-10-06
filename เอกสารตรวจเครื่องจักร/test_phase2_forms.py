import asyncio
import sys
sys.stdout.reconfigure(encoding="utf-8")
from pathlib import Path
from playwright.async_api import async_playwright

root = Path(r"C:\Users\autocad06\OneDrive - easternsugar.co.th\02.OneDriver วิศวกรรมจักรกล\06.AI Projects\260925 ตรวจเช็คเครื่องจักรออนไลน์\เอกสารตรวจเครื่องจักร")
scratch = Path(r"C:\Users\autocad06\.gemini\antigravity\brain\a2f5c826-c8b0-493b-9dab-cb418d5b574d\scratch")
scratch.mkdir(parents=True, exist_ok=True)

async def test_form(fname):
    print(f"\n================ Testing {fname} ================")
    fpath = (root / fname).resolve().as_uri()
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, channel="msedge")
        page = await browser.new_page(viewport={"width": 1440, "height": 960})
        
        errors = []
        page.on("pageerror", lambda err: errors.append(str(err)))
        page.on("console", lambda msg: print(f"[{fname} CONSOLE {msg.type}] {msg.text}") if msg.type in ['error', 'warning'] else None)
        page.on("dialog", lambda dialog: dialog.accept())
        
        await page.goto(fpath, wait_until="networkidle")
        print(f"Page loaded: {await page.title()}")
        
        # Check header
        h1 = await page.locator("h1").inner_text()
        print(f"H1 Header: {h1}")
        
        # Test Demo button to populate sample events
        demo_btn = page.locator("#demoBtn")
        if await demo_btn.count() > 0:
            print("Clicking Demo Button to populate events...")
            await demo_btn.click()
            await page.wait_for_timeout(800)
            
        # Verify table has rows
        rows = await page.locator("#eventBody tr").count()
        print(f"Total rows in event table: {rows}")
        
        # Refresh template
        print("Executing buildTemplate()...")
        render_res = await page.evaluate("""async () => {
            try {
                const c = await buildTemplate();
                return { width: c.width, height: c.height, dataUrl: c.toDataURL('image/png').substring(0, 50) };
            } catch(e) {
                return { error: e.message };
            }
        }""")
        print(f"Render Result: {render_res}")
        
        # Test PDF creation
        print("Testing PDF creation...")
        pdf_res = await page.evaluate("""async () => {
            try {
                const c = await buildTemplate();
                const raw = atob(c.toDataURL('image/jpeg', 0.96).split(',')[1]);
                const bytes = Uint8Array.from(raw, ch => ch.charCodeAt(0));
                const blob = makePDF(bytes, c.width, c.height);
                return { size: blob.size, type: blob.type };
            } catch(e) {
                return { error: e.message };
            }
        }""")
        print(f"PDF Output: {pdf_res}")
        
        # Save UI screenshot
        ui_png = scratch / f"{fname}_ui.png"
        await page.screenshot(path=str(ui_png), full_page=True)
        print(f"Saved UI screenshot: {ui_png.name}")
        
        # Save canvas print screenshot
        canvas_src = await page.evaluate("() => document.getElementById('templatePrint')?.src")
        if canvas_src and canvas_src.startswith("data:image/png;base64,"):
            import base64
            b = base64.b64decode(canvas_src.split(",")[1])
            canvas_png = scratch / f"{fname}_canvas_print.png"
            canvas_png.write_bytes(b)
            print(f"Saved Canvas Print Verification: {canvas_png.name} ({len(b)} bytes)")
            
        if errors:
            print(f"ERRORS DETECTED ({len(errors)}):")
            for e in errors:
                print("  * ", e)
        else:
            print("No errors detected! Test passed cleanly.")
            
        await browser.close()

async def main():
    for f in ["FM-ML01-ML-05.html", "FM-ML01-ML-06.html", "FM-PD01-PD-01.html"]:
        p = root / f
        if p.exists():
            await test_form(f)
        else:
            print(f"Skipping {f} (not found yet)")

if __name__ == "__main__":
    asyncio.run(main())
