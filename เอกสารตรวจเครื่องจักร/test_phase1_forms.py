import asyncio
import sys
sys.stdout.reconfigure(encoding="utf-8")
from pathlib import Path
from playwright.async_api import async_playwright

root = Path(r"C:\Users\autocad06\OneDrive - easternsugar.co.th\02.OneDriver วิศวกรรมจักรกล\06.AI Projects\260925 ตรวจเช็คเครื่องจักรออนไลน์\เอกสารตรวจเครื่องจักร")
scratch = Path(r"C:\Users\autocad06\.gemini\antigravity\brain\a2f5c826-c8b0-493b-9dab-cb418d5b574d\scratch")

async def test_form(fname):
    print(f"\n================ Testing {fname} ================")
    fpath = (root / fname).resolve().as_uri()
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, channel="msedge")
        page = await browser.new_page(viewport={"width": 1400, "height": 900})
        
        errors = []
        page.on("pageerror", lambda err: errors.append(str(err)))
        page.on("console", lambda msg: print(f"[{fname} CONSOLE {msg.type}] {msg.text}") if msg.type in ['error', 'warning'] else None)
        
        # Accept any dialogs (e.g. demo confirm)
        page.on("dialog", lambda dialog: dialog.accept())
        
        await page.goto(fpath, wait_until="networkidle")
        print(f"Page loaded successfully: {await page.title()}")
        
        # Check header
        h1 = await page.locator("h1").inner_text()
        print(f"H1 Header: {h1}")
        
        # Click Demo button
        buttons = await page.locator("button").all()
        for b in buttons:
            txt = await b.inner_text()
            if "Demo" in txt:
                print(f"Found Demo button: '{txt}', clicking...")
                await b.click()
                await page.wait_for_timeout(1000)
                break
                
        # Refresh template with demo values
        print("Refreshing print template with demo data...")
        await page.evaluate("async () => { if (typeof refreshPrintTemplate === 'function') await refreshPrintTemplate(); }")
        await page.wait_for_timeout(500)
                
        # Take UI screenshot
        ui_shot = scratch / f"{fname}_ui.png"
        await page.screenshot(path=str(ui_shot), full_page=True)
        print(f"Saved UI screenshot to: {ui_shot.name}")
        
        # Evaluate template render
        print("Executing buildTemplate() in page...")
        render_result = await page.evaluate("""async () => {
            try {
                const c = await buildTemplate();
                return {
                    width: c.width,
                    height: c.height,
                    dataUrl: c.toDataURL('image/png').substring(0, 50)
                };
            } catch(e) {
                return { error: e.message };
            }
        }""")
        print(f"Render Result: {render_result}")
        
        # Test PDF creation
        print("Testing PDF creation...")
        pdf_ok = await page.evaluate("""async () => {
            try {
                const c = await buildTemplate();
                const raw = atob(c.toDataURL('image/jpeg', 0.98).split(',')[1]);
                const bytes = Uint8Array.from(raw, ch => ch.charCodeAt(0));
                const blob = makePDF(bytes, c.width, c.height);
                return { size: blob.size, type: blob.type };
            } catch(e) {
                return { error: e.message };
            }
        }""")
        print(f"PDF Output: {pdf_ok}")
        
        # Take print preview screenshot by exporting canvas
        canvas_png = scratch / f"{fname}_canvas_print.png"
        png_data = await page.evaluate("() => templatePrint.src")
        if png_data and png_data.startswith("data:image/png;base64,"):
            import base64
            b = base64.b64decode(png_data.split(",")[1])
            canvas_png.write_bytes(b)
            print(f"Saved canvas print verification to: {canvas_png.name} ({len(b)} bytes)")
            
        if errors:
            print(f"ERRORS DETECTED ({len(errors)}):")
            for e in errors:
                print("  * ", e)
        else:
            print("No errors detected! Test passed cleanly.")
            
        await browser.close()

async def main():
    await test_form("FM-ML01-ML-09.html")
    await test_form("FM-ML01-ML-10.html")

asyncio.run(main())
