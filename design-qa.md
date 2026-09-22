# Link editor — option 3 QA

final result: passed

## Evidence and scope

- Selected visual: `/Users/lxy/.codex/generated_images/01a0c739-36ec-7690-9379-d69b874ba82e/exec-eb3bb518-886b-4c7e-983b-e5e2cc8a005d.png` (third displayed concept).
- Desktop implementation: `design-preview/screenshots/desktop.png`, 860 × 1020 pixels / CSS viewport, 1x capture. Mobile: `design-preview/screenshots/mobile.png`, 390 × 844, 1x capture.
- Source image: 1151 × 1366 pixels; natural concept viewport 860 × 1020. Compared proportionally at ~0.747 scale without changing aspect ratio.
- State: six sublinks; first expanded, remaining collapsed; unsaved draft; light theme. The edited title suffix is test data.
- Full source and rendered desktop screenshot were opened together for comparison. Header, expanded fields, collapsed rows and sticky footer are readable at this scale; separate crops were unnecessary.
- Preview mounts the actual production editor component with an explicit simulated save callback. It does not contact production APIs.

## Findings and fixes

- Initial P2: final row was partly below the footer at 860 × 1020. Reduced body and row padding; final desktop evidence shows all six rows and the footer. On mobile the body scrolls independently while actions remain visible.
- Initial P2: Escape from document focus did not enter the exit guard. Added a capture listener scoped to the open editor; verified the three-choice confirmation and made the underlying form inert.
- Dark-theme supporting text/icons now use slate-400 for readability.
- No remaining actionable P0/P1/P2 visual findings.

## Required fidelity surfaces

- Typography: inherited project sans-serif, 20px heading, 14px fields/title rows, 12px supporting text. Clear hierarchy, ellipsis for summaries, editable long URL fields.
- Layout: centered 740px modal at desktop; rounded sheet at mobile; compact accordion; 32px reorder controls; fixed footer. Six-row density matches the selected concept after padding correction.
- Tokens: white/slate surfaces, violet-600 primary action, pale violet expanded row, amber unsaved state. Dark mode inspected separately.
- Assets: official Heroicons Vue components; no raster content required. Library Bars3 grip is an intentional standard-icon substitution for the concept's dotted grip.
- Copy: Chinese save/draft/exit distinctions retained. English fallback added for other configured locales. Duplicate exit hint omitted when draft status is visible to keep the narrow footer readable.

## Behavior verified

In-app browser:
- Expand/collapse and editable fields.
- Arrow reorder and actual pointer drag; updated order announced.
- Delete and undo.
- Backdrop does not close editor.
- Close and Escape show Continue / Discard / Save and leave; Continue retains content.
- Save failure leaves modal open and preserves input with a visible error.
- Remount recovers the session draft and restores the edited value.
- Successful simulated save waits for callback then closes; reopened list retains the reordered values and shows no dirty state.
- 390px mobile and desktop layouts; dark theme.
- Browser console checked: no errors/warnings in preview at check time.

Automated checks:
- `npm test`: 11 tests passed, including immutable edits/order, failure without mutation, waiting for prior saves and refreshed versions, and rejecting page/link changes.
- Production build passed. Existing Browserslist age warning only.
- MySpace, PageDetail and SharePage pass save completion callbacks through LinkCollection. Draft keys include user, page, collection, link position and original title/URL.

## Limits

No production write or deployment was performed. API persistence is wired to existing page-update functions and covered at the save-helper level; authenticated live backend E2E was not run. Native browser unload prompts depend on browser behavior. Session drafts survive refresh in the same tab, not guaranteed after closing the tab; unavailable storage is reported instead of claiming a draft was saved. The link editor route guard was initially source-checked; the shared editor route-back flow was later exercised during the workspace iteration below.

## Follow-up polish

P3: additional translations beyond Chinese/English may be added. No further visual changes required for this scope.


# Workspace iteration — selected option 3 extended

Final result: passed for the local scope below (2026-09-22).

## Scope

Applied the compact white/slate and violet design to adding links (single, batch and bookmark HTML), page creation and metadata, collection creation/rename/transfer, sharing, confirmations and alerts. Added visible edit controls and accessible search/action labels to MySpace, PageDetail and SharePage. No changes to authentication behavior or backend endpoints were part of this iteration.

## Behavior and bug fixes

- Shared EditDialog provides fixed actions, scrollable fields, focus containment, Escape/route/unload protection, pending locks and retained inputs on failure. Link drafts are scoped to user and page; unfinished modes remain recoverable within the same tab.
- Explicit form changes use immutable full-page snapshots and only commit locally after persistence succeeds. Loading a page brief cannot trigger a destructive save of missing collections.
- Auto-save flush now drains queued writes, reports failures and permits explicit retry; page changes wait for the queue.
- Page list refresh preserves full loaded content and object identities. Late reads cannot replace newer writes or the selected page. Deleting another page no longer invalidates the active detail request.
- Share operations patch share IDs without replacing working buffers. Fixed the disconnected collection-copy event on SharePage.
- Batch URL deduplication preserves case-sensitive paths. HTML import previews collections before submission.
- Confirm/alert dialogs use HeadlessUI focus behavior and localized defaults. Destructive confirmations initially focus Cancel.

## Browser evidence

Harness: `design-preview/workspace.html` mounts the actual three Vue pages. Its Axios adapter handles all API calls in memory; all users, pages and writes are local fixtures. Reloading resets server fixtures. The control panel can simulate failed writes.

Verified through the in-app browser:

- Added a single link; UI locked while saving and closed after success.
- Edited page metadata with failed writes enabled; visible error and edited text remained. Escape showed the three-choice prompt; discard left the persisted title unchanged.
- Created a collection at the beginning; list order matched.
- Generated and disabled a readonly share URL; disable confirmation and pending locks worked; existing content remained.
- Pasted three batch URLs with one duplicate and case-sensitive paths; two distinct links were saved.
- Uploaded the local Netscape-format `bookmarks.html` fixture, previewed one folder/two links, saved it and verified both titles/URLs.
- Created and deleted an agent-created temporary page; original page content returned. Switched to the second page and verified its existing article.
- Opened PageDetail, edited a title and pressed browser Back: the guard appeared, Continue restored the detail URL and retained the draft value.
- Copied a collection on PageDetail; pending controls locked, success alert appeared and the full copy was visible. Verified the repaired copy action also creates a copy on SharePage.
- Checked the new confirmation dialog: Chinese Cancel label, initial focus on Cancel, Escape cancels without deletion.
- Reviewed 390 × 844 mobile add-link dialog: all empty-state fields and fixed footer visible. Reviewed desktop transfer and dark sharing layouts.
- Browser console at final check: no errors or warnings.

Screenshots:

- `design-preview/screenshots/add-link-mobile.png` — 390 × 844.
- `design-preview/screenshots/transfer-desktop.png` — 1280 × 800.
- `design-preview/screenshots/share-dark.png` — 1280 × 800.
- `design-preview/screenshots/page-edit-failure.png` — visible failed-save state.

## Automated evidence

- `npm test`: 31 tests passed. Includes URL parsing, save queue failure/retry, immutable explicit edits, version handling, stale reads, deletion races, share cache preservation and collection transfer cache updates. Four pre-existing authentication tests are included in the total.
- `npm run build`: passed after the final shared-dialog changes.
- `git diff --check`: passed.
- Existing Browserslist data-age warning remains informational.

## Evidence boundaries

No production data, production write, deployment or Git push was performed. Authenticated real-backend E2E, cross-page transfer through the browser, and all configured language translations were not exercised. Transfer cache behavior is covered in automated tests; Chinese and English new copy is supplied. Native unload prompts depend on the browser. Session drafts are scoped to the current tab and storage availability; they are not a promise of cross-device or post-tab-close recovery.

# Direct sub-link editing — latest option 2

final result: passed

## Target and comparison

- Selected second displayed image: `/Users/lxy/.codex/generated_images/01a0c739-36ec-7690-9379-d69b874ba82e/exec-8112d35b-9237-43ca-b38a-018fd2ac2b25.png`.
- The source is 1448 × 1086 pixels, representing an 800 × 600 component concept. Implementation was captured at a 1100 × 850 CSS viewport, 1x; the existing modal is 820px wide and its table content is 764px wide. Compare the common sub-link header/table at matching width, not the surrounding modal or the source's blank lower space.
- Source and `design-preview/screenshots/inline-table-desktop.png` were opened together in one comparison input. Both show four reference sub-links and the second URL focused. The main link title suffix is a local test value outside the compared component.
- No raster assets are required. Official Heroicons are reused; the standard Bars3 drag grip intentionally replaces the concept's dotted grip.

## Fidelity surfaces

- Typography: existing system sans, 14px cells, 13px column labels and 16px section heading; preserves the hierarchy within the existing link modal. The standalone concept's heading is intentionally smaller when nested beneath the 20px modal title.
- Layout: dedicated grip, name, URL, order and delete columns; 46px header and 55px rows; 38px direct inputs with invisible resting borders. URL receives the flexible width, matching the concept's emphasis. No accordion headers or duplicated fields remain.
- Tokens: white/slate surfaces, subtle dividers, violet outline and lavender focused row. Mobile keeps the same direct inputs on two lines with a fixed save footer and independently scrolling body.
- Assets: crisp official outline icons. No generated decorative or photographic assets are present in the concept.
- Copy: matching Chinese names, URLs, direct-edit guidance and add control. Existing precise local-draft/server-save footer copy is retained. Added a short F2/Esc hint to keep row actions accessible while Tab skips between fields.

## Findings and corrections

- P2 dark styling: scoped global selectors initially left bright grid lines and light arrow buttons in dark mode. Replaced them with scoped descendant selectors; `inline-table-dark.png` shows the corrected slate borders, dark controls and violet focus state.
- Interaction: order announcements initially read props before Vue applied the new order, and delete focus could target the removed row. Read order after nextTick and choose focus from the remaining list; browser validation confirms updated announcement and next-row focus.
- Reset the component's undo state on opening/clearing/restoring form sessions, including successful single-link saves when another add mode still has a draft. Disabled link-draft recovery actions while a save is in progress.
- Fixed an existing missing tag-placeholder translation key discovered during console checks by reusing modal.tagsPlaceholder. No outstanding actionable P0/P1/P2 visual findings. Additional locale translations remain outside this iteration.

## Validation

- Actual MySpace and AddLink components tested with the existing local in-memory API harness; no production writes.
- One-click title and URL editing; Tab from name to URL and URL to next name.
- Enter keeps the field value and does not submit. Esc reverts only the focused cell; a later Esc opens the existing unsaved-exit prompt.
- F2 focuses current-row actions; Esc returns to its field. Arrow sorting and actual pointer dragging preserve values and update the announced order.
- Delete focuses the next row; Undo restores its full values and position.
- Existing session draft restored into the new table. Failed save leaves values and modal intact; all fields and row actions disable during saving.
- Add-sub-link focuses its name. Missing sub-URL validation focuses that URL cell; filling it and submitting creates the new link successfully.
- Mobile 390 × 844: no document horizontal overflow (clientWidth and scrollWidth both 390); all rows reachable by body scroll; save/error area stays visible.
- Dark desktop inspected after correction. Browser console checked at handoff.
- `npm test`: 31 tests passed. `npm run build` and `git diff --check` passed. Browser interaction checks above cover the new component; no claim of authenticated live-backend E2E.

Evidence: `design-preview/screenshots/inline-table-desktop.png`, `inline-table-mobile.png`, `inline-table-dark.png`.
