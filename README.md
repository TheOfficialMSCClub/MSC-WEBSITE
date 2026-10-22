# Management Strategy Council — interactive briefcase edition

A responsive, static editorial website. HTML, CSS, and JavaScript keep this version easy to host and hand over. No API keys or production database are required. All 27 uploaded executive graphics are included as optimized WebP images. Seventeen members are represented individually, with names and roles transcribed from their supplied graphics.

## Current editorial redesign

`dist/msc-editorial.css` is the final presentation layer. It establishes Georgia display type, Arial body text, ivory reading surfaces, charcoal scene backgrounds and the established MSC maroon. Shared gutters, readable 16–17px body copy, ruled indexes and simple portrait mats replace competing decorative treatments. The agenda, glossary, partnership area and dialogs each have a distinct layout. The fixed navigation keeps the same maroon color throughout. Decorative stock-style collages are suppressed; real supplied photographs and original club graphics remain the visual anchors. Text is visible immediately rather than waiting for repeated reveal effects.

This direction applies the user-supplied references:

- https://aitoolpick.org/blog/ai-generated-website-checklist/
- https://hostadvice.com/blog/creating-a-website/how-to-make-a-website-look-professional/
- https://www.grigora.co/blog/how-to-make-my-website-look-professional/

All existing sections, wording, destinations, controls, member data, original photographs and functional JavaScript are preserved. The case choreography, full-screen puzzle, pointer-driven suspect board, chess profile directory, filters, searches, original-graphics gallery, inquiry copying and browser-local logo preview are unchanged. Earlier notes below document the evolution of those retained scenes; this section describes the active typography and surface treatment.

Verification compared normalized HTML copy, 78 IDs, 36 controls and 24 links with the prior version, plus unchanged hashes for 67 functional, data and photograph files. The new CSS parses successfully. DOM checks exercised the main app in normal and reduced motion; existing scene checks passed at desktop and phone dimensions, including all 17 chess portraits without programmatic upward scrolling. Live browser visual verification is unavailable in the managed environment; no rendered-browser layout claim is made.

## Editing content

Edit `dist/content.json` for events, members, department descriptions, and the word archive. Assets live in `dist/assets/`. Member `crop` arrays are normalized `[x, y, width, height]` view boxes into the original supplied graphic; the source photographs are not redrawn. Edit `dist/index.html` for page copy. This version uses browser animation APIs and CSS rather than requiring an animation framework.

## Confirm before a public club launch

- Replace the seal displayed from the supplied poster with a clean original MSC logo if available. The Import logo control stores a local browser preview only; it does not upload a public asset or alter other viewers’ logos.
- Review member name spellings and role transcription from the supplied executive posters. Billy is shown as Billy Batsaikhan and Jayden Lee as on their individual profile graphics; longer variants appear in the source group graphics.
- Confirm Strategy Summit dates, format, and registration details.
- Confirm the two preview word entries or remove them.
- Add the actual membership and registration destinations if different from Instagram.
- Confirm club contact information and partner details. No sponsor logos or statistics have been invented.

Portraits and the Operations feature come from the supplied executive graphics. The earlier walking shot and illustrative worktable are not displayed. Strategy Summit now has an original technical chess illustration; it is brand artwork rather than event photography.

## Behaviors

Fullscreen navigation; responsive mobile layouts; native modal focus management; reduced-motion mode; a pausable rendered briefcase opening sequence; a full-screen printed puzzle, an ambient technical background, and an interactive council chessboard; department filters and member search; profile views; an original-graphics gallery; event details; word search and detail views; partner inquiry copying. No message is sent. A user-imported logo may be stored locally in that browser after the user chooses a file.

## Art direction and cinematic assets

The art direction follows the supplied msc-no-ai-look guidance within the approved MSC identity: Times New Roman display typography, Arial text, paper #F7F5F0, ink #191817 and maroon #571020. All real member names, roles, portrait crops and original graphics are retained.

The individual portraits now sit in a dark picture frame with an off-white mat and archive caption. Profile detail portraits also have frames. The previous walking-shot story visual and the second Learn/Network/Succeed sequence are removed. A new editorial feature uses the supplied Operations photograph with the named subjects in its caption. A compact solid navigation bar returns after the hero. Generic headings and the repeated oversized closing slogan are simplified. The two invented workshop/community event concepts are removed; Strategy Summit remains, with details explicitly awaiting confirmation.

### Briefcase film

The active hero entry is `dist/hero-film.mjs`. The briefcase is rendered offline with Cycles in Blender using the original authored geometry, studio area lights, physically based aluminium and cloth materials, stitched lining, recessed compartments and mechanical hardware. This is a rendered asset, not a photograph of a physical case. No external video-generation subscription or API is used. No people or member photography have been generated or changed.

The original render pipeline produced 41 opening frames. The premium predecessor introduced 141 transparent frames at higher resolution. The ground shadow catcher was removed because it introduced a low-alpha black matte across the image. The complete sequence now has genuinely transparent borders, checked during packaging; CSS adds a small contour shadow to the case itself. The original sequence is retained in source; the intermediate `assets/case-cinema/` sequence is retained; the premium predecessor is `assets/case-premium/`. `scripts/export-case.mjs` exports the source Three.js geometry and hierarchy; `scripts/render-case.py` makes the original studio renders; `scripts/render-cinematic-case.py` extends that authored scene with a stitched leather notebook, layered printed paper, a pen with separate metal fittings, paper briefing cards, a camera orbit, a closer camera angle, and three staggered card-flight paths; `scripts/package-case-film.py` checks that the opaque product stays inside every frame and converts the sequence to cropped WebP assets. Pass input/output paths to each script. Blender 4.3.2 and Python/Pillow were used for the current renders. WebP packaging is parallelized and rejects any nontransparent frame edge. The earlier live WebGL entry remains in source as an alternative but is not loaded by the page.

The browser blends neighboring loaded poses on a 2D canvas, tied to the same shared scroll timeline and text chapters. The active film now follows the full scroll timeline, including the orbit, closer interior view, and contents flight. It uses a bounded nearby-frame decode queue: up to 24 decoded frames on desktop and 12 on phones, with two concurrent decodes. Phones request alternate frames through the opening, then use every later pose for the stronger orbit and card flights. The hero extends to 560 viewport heights on desktop and 520 on phones. Its case retains the approved opening size as the lid opens: a full-stage canvas preserves the original render scale, the briefing overlays the case, and only a subtle 3.5% final approach is added. The taller open case can crop at the viewport edges as part of the background composition. `film-framing.mjs` preserves the exact initial position and size on desktop and phones. The photographic studio has restrained parallax and a diffuse moving window-light reflection; a directional shade keeps the overlay text readable. Reduced-motion mode loads one still and shows chapter content in normal flow. Pause holds the current opening pose. The first frame is the no-JavaScript and loading fallback. Native scrolling and the Learn/Network/Succeed chapter controls are preserved. There is no continuous idle render loop.

### Full-screen puzzle, ambient interface, and interactive chess

`dist/puzzle-scene.mjs` now fills the viewport with 900 interlocking pieces on desktop and 720 on phones. Shared tab patterns are grouped into 51–52 instanced draw batches rather than hundreds of separate draw calls. Per-instance texture offsets preserve a continuous printed image across every seam. The desktop study retains the original brain illustration; a portrait composition keeps the full illustration visible on phones. The assembly reverses with scrolling, responds to pointer inspection, and has Assemble/Scatter and Pause controls. Reduced motion uses a completed print in normal flow. WebGL failure restores the print. The phone scene is capped at 30 updates per second while moving; the assembled scene stops when settled.

The previous foreground strategy-console panel is removed from the active page. `dist/ambient-hud.mjs` draws an instrument field behind the hero and council copy: rotating traces, a neural lattice, passing signals, peripheral registers, and department annotations. The field responds slightly to the pointer and never captures clicks. It is decorative and hidden from assistive technology. Pause, reduced motion, tab visibility, and viewport visibility stop its animation. The old console module remains in the repository as a prior implementation but is not loaded.

`dist/chess-scene.mjs` makes the chessboard a directory for all 17 council members. Co-Presidents are kings, Corporate Relations queens, Events rooks, Finance and Operations share the bishop group, and Marketing use knights. Eight unassigned pawns are reserved for future associates; no current member is a pawn. The name directory follows King, Queen, Rook, Bishop, Knight, Pawn. `chess-roster.mjs` assigns a unique square to each actual member. Selecting a modeled piece or an accessible name button brings that piece forward on an eased arc while the camera moves into a close-up. A native modal overlay reuses the live board and pairs the piece close-up with a much larger framed portrait and role. Selecting a name never scrolls the page. A same-size placeholder preserves the board section layout while the canvas is in the overlay; closing returns it to its original parent and restores focus with preventScroll. The original portrait crops and member data are retained. View full profile closes this overlay before opening the same original introduction graphic as the team grid. Previous/next person, a member counter, Back to board, pause, Escape, reduced motion, and a usable name directory without WebGL are supported. Arrow keys browse the board’s profiles; within the name index, arrow keys and Home/End move keyboard focus without selecting a member. Hovering a piece highlights its corresponding name, and focusing a name highlights its board position. The scene initializes near the viewport and renders only while visible and moving; an open overlay also counts as visible. `chess-focus.mjs` handles interruptible piece and camera transitions; switching members returns the previous piece to its own square while the camera briefly pulls back to reveal the handoff, then closes in again. Resizing during a transition preserves the current piece poses. Profile transitions respect pause and reduced motion; focus returns to a visible control when a profile closes. This is a council portrait, rather than a playable chess position. The existing rendered board remains the still fallback.

### Premium case and photographic environment

The premium material sequence is retained in `assets/case-premium/`: 141 higher-resolution transparent frames with directional aluminium micrograin, cooler edge reflections, warm studio fill, deeper woven lining, individual saddle stitches, a stitched pen sleeve, and sharper letterpress. `scripts/render-premium-case.py` builds on the same exact original shell and mechanical pivot. No frame contains a background matte. Packaging includes per-frame opaque bounds and a separately cropped first-pose poster, so the browser can preserve a consistent physical render scale. The source frames retain the complete product; the full-stage webpage deliberately allows background cropping once the case opens. The player blends neighboring poses with premultiplied additive compositing for smoother subframe scrubbing while retaining the bounded 24/12-frame decode cache.

The full-bleed photographic studio plate is `dist/assets/hero-studio-v3.webp`, generated with the built-in image-generation tool. It contains no people, case, or event photography. The animated case is composited over it as a separate original render. The complete generation prompt and asset provenance are in `docs/visual-assets.md`.

### Research applied

- NN/g, Prompt to Design Interfaces: weak hierarchy, repeated content, clutter and disconnected components can make generated interfaces ineffective. The duplicated chapter sequence and invented event cards have been removed.
- Beaucoup's Bisous case study in Codrops: use an editorial grid and restrained motion to let strong imagery lead. MSC uses framed portraits, a distinct photographic feature, quieter controls and one central cinematic case interaction.
- Locomotive's Editorial New case study in Awwwards: typography can supply the visual identity. The existing serif/sans pairing is used with varied scale and section rhythm rather than adding unrelated component effects.

- Bearplus’s Heron case study: build a distinct visual vocabulary from the subject’s own working tools. MSC uses questions, evidence, decision paths, feedback, and annotated chess artwork rather than unrelated technology effects.
- Joseph Santamaria’s Codrops case study: camera paths and scene progression support a continuous scroll narrative. The case now has distinct opening, orbit, approach, and content-release beats.
- Pell Mell’s case study: editorial rhythm and restrained controls. The new diagrams vary the visual pace while the hero remains the signature motion.

References: https://tympanus.net/codrops/2026/04/28/more-than-a-portfolio-building-a-scroll-driven-3d-world-with-something-to-say/ ; https://tympanus.net/codrops/2026/10/12/heron-ai/ ; https://tympanus.net/codrops/2026/03/27/pell-mell-crafting-a-visual-exploration-platform-with-editorial-rhythm/ ; https://www.nngroup.com/articles/vague-prototyping/ ; https://tympanus.net/codrops/2026/06/29/inside-bisous-designing-an-editorial-experience-for-cinematic-cgi/ ; https://www.awwwards.com/editorial-new-variable-typeface-by-locomotive-wins-site-of-the-month-october.html

### Verification limits

Code, original content, profiles, search, modals, chapter states, 141-frame subframe scrubbing, cache bounds, instanced puzzle geometry and controls, ambient motion, and council piece assignments, member selection, profile dialogs, interrupted camera transitions, reset, previous/next wrapping, keyboard focus, reduced motion, fallback controls, resize continuity, and close-up mesh framing are checked locally. The case key renders are visually inspected and all source frames are checked for product clipping. The latest case-framing checks cover all 141 poses at five viewport sizes and DPR 1/2; native asset compositions verify the intended full-stage overlay. Chess overlay checks cover all 17 profiles, no programmatic page scrolling, focus restoration, single-canvas reparenting, modal handoff, and motion/fallback behavior. The per-section 1440px/390px browser screenshot audit cannot run because the managed browser-testing integration is unavailable. Full browser layout and Lighthouse scores remain unverified.

## Hosting

The static root is `dist/`. The project is initially published privately through Sites. The same static files can be hosted elsewhere, including Vercel, after the club’s hosting and ownership preferences are finalized.


### More pronounced camera movement and printed section studies

The preceding film is retained in `dist/assets/case-expressive/`. Its first 51 WebP frames and loading poster are copied byte-for-byte from the approved premium opening. `scripts/case_motion.py` gives Network a pronounced camera orbit against the shell rotation, then returns to a higher interior view for Succeed. Three physical briefing cards rise earlier and fan apart on staggered curved paths with larger rotations. `scripts/render-expressive-case.py` reuses the full premium material, lighting and geometry setup in Blender 4.3.2, with 22 Cycles samples and transparent square source frames to protect the lid and flying cards. `scripts/package-expressive-film.py` copies the opening and packages the new poses with individual bounds and dimensions. Each blended layer is positioned from its own native bounds, preserving scale across differently cropped assets. The same bounded 24/12-frame cache and scroll timeline remain active.

The glossary has original paper-sheet SVG artwork for Draft / Test / Refine. The partnership section has a generated editorial compass, burgundy pencil and notebook study, feathered into the page. The closing section uses the supplied MSC seal as an oversized printed background with fine folded rules. `section-art.mjs` coalesces scroll updates, touches only visible sections, has no idle animation loop, and honors reduced motion. The new asset and its complete generation prompt are documented in `docs/visual-assets.md`.

The expressive film is 9,559,424 bytes including its poster. Final checks verify all 141 placements at five viewport sizes and DPR 1/2, byte-identical opening assets, alignment across source crops, the actual film controller at 1440px and 390px (cache bounds, later-pose sampling, pause and still mode), scroll-only section decoration, and the retained 17-member overlay flows. Live browser visual verification remains unavailable in this environment.

## Three-card camera sequence

The active hero uses `dist/assets/case-recessed-v4/manifest.json`. Each chapter has a separate printed page: Learn rises from the tray onto the lid as the camera approaches for reading. The camera then pulls back while Learn returns to its place inside the tray, before Network rises. Network repeats the same ascent, close-up and return before Succeed. Returned pages remain visible inside the case. The camera tracks the moving card’s position during ascent and descent. Scrolling backward reverses the same registered paper paths and camera movements. The full original opening size and case geometry remain in use.

A shared compositor transform moves the case and its HTML pages together, keeping the text physically seated on the lid during close-ups. `hero-timeline.mjs` defines synchronized ascent/zoom, reading hold, and descent/pull-back intervals; navigation jumps to the reading holds. Scroll velocity eases into and out of each movement. Pause holds the entire case, pages and camera; reduced motion and unavailable assets restore readable ordinary chapters.

The first 52 original rendered poses are registered into transparent 896px square textures and enriched with a depth-tested procedural textile material. The maroon cushioning has softly padded diamond panels, inset seams, fine weave, thread highlights and directional nap, using the original lighting and case surfaces. The shader excludes paper and metal and preserves the original silhouette and motion registration. The player uses a lightweight WebGL shader to warp adjacent poses into their intermediate positions before blending. Bidirectional displacement is rasterized from the exact authored case meshes, hinge and cameras, rather than estimated from photographic features. Quarter-pixel motion encoding keeps the metal silhouette and hardware aligned. Reading close-ups use a compositor transform without decoding or repainting a new case pose on every scroll update. A short decoded loading buffer, bounded image/texture caches and smaller phone decodes protect playback performance. Unsupported WebGL or ImageBitmap uses the eased Canvas renderer.

To rebuild the active texture set, run `python scripts/package-continuous-case.py` after exporting the original briefing film and dock metadata, then `python scripts/enhance-case-lining.py` to author the tailored material and matching poster. The offline pipeline uses Pillow, NumPy, OpenCV and ModernGL with Mesa EGL; Node exports exact case geometry and camera matrices through `scripts/export-case-motion.mjs`. No runtime dependency, API key or third-party browser library is added. Original Blender geometry, textures, lighting and film assets remain available as sources.

## Bishop directory and strategy studies

Finance and Operations remain bishops in the same original board positions. Below the board, one Bishops heading contains Finance and its two names, followed by Operations and its two names. Profile labels use the person’s own department. All 17 portrait overlays retain the large photograph, close-up piece, no-scroll opening, and focus restoration.

The agenda has a pale planning atlas and framed event artwork. The team heading has a diagram of the actual council connections. The gallery uses archival framing and a subdued workbench background. The glossary includes a decision-and-feedback study. Partners retain the compass photograph with faint connection routes; the closing section uses a full-bleed burgundy detective worktable. Section motion is eased, limited to visible sections, and respects reduced motion. Asset prompts and provenance are in `docs/visual-assets.md`.

### Verification

`check-case-sequence.mjs` verifies all three flights, lift/land/zoom/pull-back ordering, paper registration and reading crops at five sizes, scroll response at 30/60/120Hz, and all GPU texture references. `check-paper-flight.mjs` retains the original shell and first-sheet registration checks. `check-case-framing.mjs` verifies original opening scale and no shrink across all 141 poses. `check-council.mjs` verifies all 17 assignments, unique positions, modeled silhouettes and camera transitions.

Actual-module DOM integration checks cover the WebGL controller, delayed loading, all three page handoffs and close-ups, reverse scrolling, inert links, pause/resume, image/texture cache bounds and idle-loop termination at 1440px and 390px, plus missing-frame, reduced-motion and Canvas/HTML Image fallbacks. Native Mesa EGL compiles and links the exact GLSL ES 1.00 shaders, renders fractional poses and verifies source-pixel endpoints. Existing council checks cover all 17 assignments and camera transitions; the original profile overlay checks remain unchanged. CSS parsing and all local HTML/CSS asset references pass. Native image compositions were inspected for desktop and phone paper placement. Live browser layout/screenshot verification remains unavailable because the managed browser integration is not present.

## Red-thread evidence board

“People make the difference” now uses a dark, tactile evidence board with pinned working notes. Twelve red cotton threads converge on one shaded red pushpin that follows the pointer; separate fixed connections keep the board coherent at rest. The center follows exact section-relative mouse coordinates with easing. Thread shadows, fine highlights, a single moving pushpin, paper edges and pinheads are drawn directly in Canvas. The original Operations photograph and text remain steady and readable. All eye and mirror layers have been removed from the page.

`detective-scene.mjs` exports the native board drawing for visual QA and drives movement only while needed. Pause freezes the board. Pointer exit returns the pin to its resting position. Touch/reduced motion use a still composition; offscreen and hidden-document states suspend drawing. No generated imagery or external service is needed for the new board.

The existing word ribbon continues repeating Learn / Network / Succeed / Think further from right to left, with two identical repeated groups, pause/resume and reduced-motion support.

## Refined council chessboard

The chess section and enlarged profile stage use warm charcoal and burgundy atmosphere, with warm ivory typography. Muted rose-gray and deep MSC-maroon wood squares provide greater separation from the ivory pieces. The roster remains an ivory index. The piece finishes use subtle procedural ivory/lacquer textures and micro-bump maps; the wood frame and squares have directional grain. The supplied classic chess-set reference guides the new details: a slim 0.33-unit cabinet edge, fine double brass fillets, clean continuous border fillets, and smoothly turned profiles with 112 radial segments. Ivory and oxblood pieces have felt soles, matching ivory/oxblood collars, turned beads and crowns. Knights have one continuous sculpted head/neck/chest surface with integral cheek and crest relief, tapered ears and restrained carved facial details.

Warm key, cool fill and rim lighting distinguish silhouettes, while a receiving plane and more precise shadows ground the board. All existing member assignments, placeholder pawns, selection close-ups, portrait overlays and no-scroll opening behavior remain intact.

`chess-materials.mjs` creates small deterministic native DataTextures without external images or browser-only drawing dependencies. `scripts/export-chess.mjs` exports the actual 17 council pieces and eight reserved pawn slots with their real finish maps. `scripts/render-council-native.py` renders the matching transparent fallback through Mesa EGL; the result is `dist/assets/chess-board-gallery-v7.webp`.

### Latest verification

The actual Canvas controller passes pointer-coordinate tracking, eased response, pause, return to rest, touch, reduced motion and offscreen/idle tests. Native drawing compositions were inspected. The revised model passes all 17 member assignments, mesh raycasting, close-up silhouette bounds, interrupted camera transitions and resize continuity. Desktop/phone DOM checks pass all 17 portrait overlays, next/previous selection, Finance/Operations subgroups and focus restoration without programmatic page scrolling. Material checks verify improved ivory-versus-board luminance separation, finish maps and beveled geometry. All page/style references resolve and CSS parses. Native Mesa renders inspect the refined materials and fallback. Live browser visual verification remains unavailable in this managed environment.

## Persistent navigation

The logo, Join the council and Menu remain fixed above every section, including the complete opening case sequence. A solid MSC maroon surface and ivory text remain the same color throughout the site; the compact state retains those same colors.

## Button-tufted leather and satin board refinement

The supplied burgundy upholstery reference guides deeper rounded diamond padding, leather-covered recessed buttons, gathered creases and fine pores. `scripts/enhance-case-lining.py` registers the new native material against the exact original 52 case poses using geometry depth tests. It writes `case-tufted-v3`, with the original silhouette, projected paper/dock positions and all 51 motion fields. The browser interpolation and paper choreography remain the same. No stock photograph is embedded.

The chess perimeter has continuous fillets without dotted marquetry. Every piece component uses its own ivory/oxblood finish or the existing dark carved details; the crowns, finials and collars have no gold material. Board tiles have roughness 0.70–0.72, clearcoat 0.045 and reduced environment response for softer upper-board reflections. Member interactions and silhouettes pass their existing checks.

## Cohesive carved chess set and viewer-facing selection

`chess-pieces.mjs` replaces all six designs with a cohesive smooth carved set inspired by the user’s supplied reference: turned bases with subtle fluting, a single rounded king cross, a scalloped queen coronet, a hollow rook crown, a bishop with a real recessed mitre cut, an integrated knight sculpture, and a clean pawn orb. Geometry is shared across matching pieces. Finishes remain ivory/oxblood without gold; the satin board and clean continuous border are retained.

Every sculpture has a defined local front and authored board orientation. `CouncilFocus` computes a 70-degree near-sideways target relative to the camera and chooses the shortest rotation from the current pose. It eases this turn while the piece comes forward, reverses to its board orientation on dismissal, and handles interrupted selections and reduced motion. All 17 camera-facing directions are checked against the actual world-space camera vector, alongside existing raycast, framing, handoff and directory tests. Native renders inspect all six designs and the full council board; live browser visual QA remains unavailable.

## Recessed lid and ornate council set

The active film is `case-recessed-v4`. `export-case-motion.mjs` supplies an additional recessed insert with a 0.289-unit return depth, sloped walls, rounded edge and inset tufted panel. `enhance-case-lid.py` depth-tests that insert against the original metal shell and base, retaining the original lower-case artwork. It rebuilds all 51 bidirectional physical motion maps for the deeper lid. The original case silhouette and projected paper/dock coordinates are preserved.

The detailed chess set adds continuous carved-leaf friezes, vein relief, guilloche collars, deeper tapering stem flutes, a petal dome/turned royal finial and recessed horse jaw, eye and flowing mane details. These are native modeled surfaces in the retained ivory and oxblood finishes. The supplied carved set is a design reference; the native models are original interpretations. Close-ups present every member’s piece at a near-sideways 70-degree angle with shortest-path eased turns and return-to-board orientation.

## Anatomical knight, cut mitre and charcoal gallery

The knight is now an offline sculpted continuous surface, extracted from smoothly blended anatomical volumes with carved eye sockets, inner ears, nostrils, a mouth, a forelock groove and incised mane locks. `scripts/sculpt-knight.py` regenerates the shared indexed `knight-sculpture.mjs` mesh (60,142 vertices / 123,092 triangles), quantized for transfer with smooth analytic surface normals. It uses NumPy and embeds no external model or photograph. The original turned pedestal and relief bands are retained.

The bishop has a broader, taller tapered mitre, a deeper diagonal slit with correctly bounded internal walls and floor, and a finer finial. Its head is oriented so the cut remains readable during the retained 70-degree close-up. All 17 selected sculptures still fit phone and desktop viewports, return to their authored orientations and retain existing profile controls.

The former slate-blue background is replaced by a charcoal gallery with subdued burgundy light and faint texture in the profile stage. Ivory and maroon pieces, satin tiles, slim board and current fixed navigation are retained. The matching native transparent fallback is `chess-board-gallery-v7.webp`. Native render and DOM interaction checks pass; live browser visual verification remains unavailable.
