
2026-10-01: Acquired project lock; created standalone เอกสารตรวจเครื่องจักร/FM-ML01-ML-02.html from read-only PDF. Preserved 26 numeric columns, 24 hourly rows, controls and signoff fields. Edge browser verified 624 numeric inputs, save/reload, out-of-range indication, no script errors. Released lock. Local file verified; OneDrive cloud sync status unavailable.

2026-10-01: Locked and updated standalone turbine form with hourly selector, grouped touch-friendly input cards, previous/next navigation, 24-hour progress, next-day date, automatic local save, synchronized overview table. Preserved JSON v1 schema and original data keys. Verified Edge save/reload, isolated hourly values, midnight date rollover, out-of-range indication, 390px mobile no horizontal overflow, no browser errors. Released lock; local writes verified, cloud sync unavailable.

2026-10-01: Locked standalone form; added five touch/pen pointer signature dialogs, fitted image previews and per-signature immutable-on-reload ISO timestamp displayed in Asia/Bangkok. JSON and local storage include normalized signature strokes; legacy JSON remains supported. Tablet portrait 820px and landscape 1180px checked with touch emulation, no overflow or browser errors. Verified signature save/reload, timestamp stability, JSON roundtrip, legacy import and compact print signature height. Physical iPad Safari not tested. Released lock; OneDrive cloud sync unavailable.

2026-10-01: Locked and changed hour buttons to gray empty, yellow partial (including note-only), green complete 26/26. Blue outline preserves selection without masking status. Added counts and status text, legend and accessible labels. Edge tablet check confirmed all state colors. Released lock; local writes verified, cloud sync unavailable.

2026-10-01: Full viewport signing dialog, responsive line widths, thin grid, fitted preview canvas with embedded Thai timestamp/name/position. Added signer position and signature identity snapshot. Prevented context menu/drag/copy on previews; no absolute copy protection claimed. Verified pointer drawing, fullscreen tablet bounds, legacy imports and signature metadata roundtrip. Released lock.

2026-10-01: Added separate persistent production-year default; remembers on change, retains on new-record reset, seeds from existing record once, does not overwrite default during JSON import. Clearing year removes default. Edge verified reset/reload and changed default. Released lock; local writes verified.

2026-10-01: Fixed cascading responsive/screen styles overriding printed font sizes and spacing. Added final print rules with five signature columns, compact rows, metadata, names/positions and footer. Browser PDF validated one A3 landscape page with all 624 sample values and five signatures; rendered visual check. Released lock.

2026-10-01: Locks record when all five signatures exist: all fields read-only, signing/removal/reset/import blocked; print/export/hour navigation remain available. Restores lock on reload and complete JSON import, preserves read-only after hour navigation. Browser checks passed with no script errors. Released lock.

A4 landscape print update: compact table, metadata, five signature boxes and footer. Verified populated signed record renders as one A4 page; visual inspection passed. Released lock.

2026-10-02: Fixed signature name/position display refreshing when entered after signature and before print; legacy signatures use current populated name/position. Increased embedded text sizes. Redesigned A4 print with green-gray header, metadata strip, alternating rows, larger table height, five compact signature cards, footer rule. Populated legacy signatures browser PDF remains one A4 landscape page; no script errors and rendered inspection completed. Released lock.

2026-10-02: Added GPS latitude/longitude, accuracy and capture time to each new signature and JSON; display in signature canvas. Fresh high-accuracy geolocation requested at confirmation. Explicit status and user choice on denied/timeout/unsupported; no fabricated GPS for legacy signatures. Disabled signing controls during capture. Mocked browser geolocation verified capture and reload metadata with no script errors. Real-device GPS permission not tested. Released lock.

2026-10-02: Compact signature cards; print hides duplicate name/position inputs, canvas shows centered single-line name and position under signature, centered timestamp/GPS. Confirmed centered canvas and one A4 page. Released lock.

2026-10-02: Added demo unlock password 1234 via password dialog. Wrong password retains lock; correct password preserves values but clears all approvals and persists unlocked state. Password excluded from record JSON, print and autosave. Browser verified invalid/valid password, reload, data preservation and editable fields. Released lock.

2026-10-02: Phase 1 delivered: hourly QR camera scan via bundled jsQR with exact machine-code match, explicit manual fallback, live-camera compressed JPEG evidence, fresh GPS and accuracy, distinct hourly evidence badges, JSON/local persistence and validation. Evidence controls lock after signatures; reset clears evidence; changing machine requires confirmation before clearing incompatible evidence. Camera tracks stop on close and late permission returns. Browser verified hourly isolation/reload, JSON roundtrip, lock, reset and fake-device camera capture/track stop; no script errors. Actual iPad camera/GPS not verified. No server time/identity/anti-tamper claims. Released lock.

2026-10-02: Added signing gate requiring 624 valid numeric values plus date/year/department/section/machine and signer name/position. Added bundled TH Sarabun regular/bold for offline tablet and canvas. Added marked Demo numeric values across 24h, demo button confirmation and initial empty-browser fill without overwriting existing records; no fake signatures/photos/GPS. Browser gate tests passed, font applied, no errors; print adjusted to one A4 landscape page. Released lock.

2026-10-02: Chose Sarabun web regular/bold from Google Fonts with OFL stored locally. Screen typography 16px body/input, 44px buttons; phone 360/390px responsive header, metadata, tools and hourly grid. Print keeps TH Sarabun. Verified font load, mobile no overflow and no script errors. Released lock.

2026-10-02: Enforced staged signatures: both recorders before either supervisor; both supervisors before final approver/department head. Guards on opening and confirmation; prerequisite removal or replacement invalidates downstream approvals. Browser verified stage transitions and dependent clearing, no errors. Released lock.
Follow-up: prerequisite removal invalidation scheduled after event propagation using setTimeout, avoiding microtask running before delegated removal handler.

2026-10-02: Moved prerequisite waiting message into empty signature frame beneath placeholder in red; removed redundant external status line. Browser verified text and red color. Released lock.

2026-10-02: Separate direct PDF download and native print buttons. Client-side A4 landscape PDF rasterizes Sarabun table, metadata, signature canvases; no external upload or runtime dependency. Print/canvas switched to Sarabun web font. Verified downloaded PDF and browser print each one A4 page, no script errors. Direct PDF text is raster; CSV/JSON remain analysis outputs. Released lock.

2026-10-02: Print/PDF uses original read-only PDF rendered artwork with original logo, header, merged table headings, control rows, exact cell positions. Values overlaid with Sarabun; bottom signature strip retained custom design. Embedded artwork avoids local file canvas taint. Both direct PDF and print verified one A4 landscape page, visual inspection completed. Original PDF unchanged. Released lock.

2026-10-02: Added standalone document-recording Data Center in เอกสารตรวจเครื่องจักร/data-center.html. IndexedDB HTML form library, add dialog with title/code/department, search/filter, built-in turbine link, open uploaded HTML, download/remove, JSON library backup/restore. No central result ingestion yet. Uploaded forms expected standalone or resolvable relative dependencies; notice shown. Verified HTML upload, reload persistence, opened form entry, 390px mobile no overflow, no script errors. Released lock.

2026-10-02: Inspected user exported PDF; signatures were faint from thin stroke downsampling. Replaced preview-image downscaling with direct normalized stroke drawing into full PDF canvas at 0.75pt dark ink, separate readable name/position/time/GPS text; removed grid under printed ink. Increased on-screen ink weight. Five-signature output rendered and reviewed, still one A4 page, no browser errors. User original PDF unchanged. Released lock.

2026-10-02: Moved toolbar, demo notice, metadata, save status and hour selector into right header panel. Desktop identity left, controls right; responsive stacked/tablet/phone arrangement. DOM retains IDs and original print template logic. Browser verified 1600px/390px no overflow, controls relocated, hour navigation and template generation; no errors. Released lock.

2026-10-02: Created กฎและคู่มือสร้างแบบฟอร์ม.md consolidating conversation requirements, current demo behavior, workflow, signature stages, evidence, original-template print/PDF, Data Center, data formats, acceptance criteria and future server scope. No app behavior changed.

2026-10-02: Added signer name/position dropdowns with deferred user-managed directory, no invented real names. Preferences per signing role remain across reset/reload, existing names seeded, JSON retains selected values; selectors disabled for signed lock. Added manage-directory dialog. Browser tested directory add/select, auto position, reset/reload and JSON fields, no errors. Updated form guide. User will provide names later. Released lock.

2026-10-02: Created self-contained FM-ML01-ML-11.html from original Rev.00 bridge/High speed belt PDF per form guide. 5 equipment groups x MT/G/DE/NDE x 24h = 480 required temperature values, strict <80 Celsius, original definitions retained (MT not expanded beyond source). Bundled scripts, QR decoder, fonts and original-template artwork; independent record/preferences keys and shared signer directory. Signature workflow, unlock, evidence, JSON/CSV/PDF retained. Data Center built-in catalogue now includes bridge form. Browser verified blank initial form, demo, boundary alarm at80, save/reload, JSON roundtrip, staged signing gates, completed record lock, mobile no overflow, one-page print/PDF and catalogue. Original source unmodified; physical tablet camera/GPS not tested. Released lock.

2026-10-02: Replaced signer management with staged table CRUD: add multiple rows, edit all/per row, delete with confirmation, validate complete rows, deduplicate and save all atomically in directory preference. Cancel discards staged edits; record selected names unchanged. Rebuilt bridge standalone form. Verified add/edit/delete/save/reload and persisted position on both forms, no script errors. Released lock.

2026-10-02: Added faint grid background behind signature strokes in shared print/PDF template, retaining dark thick ink and clean metadata area. Rebuilt bridge form. Both PDFs verified one page; signature crop visually inspected. Released lock.

2026-10-02: Full-box faint signature grid with variable spacing seeded from signedAt and role; printed REF identifies deterministic pattern. Stable on repeated export and changes with new signing timestamp, verified in browser. Not a standardized barcode or tamper-proof evidence. Rebuilt both forms; released lock.

2026-10-06: Antigravity aligned FM-ML01-ML-11.html UI and interactive behavior to match FM-ML01-ML-02.html: restored automatic demo initialization on first visit (seeding date, 2569/2570 year, DEMO-BRIDGE-01, green complete badges across 24h, and unlocked recorder signatures), upgraded 5-group responsive layout with card 5 spanning full-width 4-column grid on desktop/tablet, added structured machinery abbreviations card (MT/G/DE/NDE with <80°C threshold), and descriptive Thai point labels on input cards. Verified Edge browser loading, reset, demo refill, hour navigation, and PDF generation with 0 errors. Released lock.

