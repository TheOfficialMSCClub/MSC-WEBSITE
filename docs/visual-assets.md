# Visual asset provenance

The generated environment used by the website is `dist/assets/hero-studio-v3.webp`.
It was created with the built-in image-generation tool, then encoded as WebP for the site. The case is a separate original Blender render; the chessboard and puzzle use original geometry.

The prompt was:

> Use case: product-mockup. Asset type: full-bleed website hero BACKGROUND PLATE, landscape 16:10. Create a highly photorealistic, elegant, cinematic photography studio environment for a luxury SILVER ALUMINIUM ATTACHE CASE that will be composited later. DO NOT put any case, suitcase, bag, watch, chess piece, computer or main object in the image. Subject is ONLY the empty background environment. A dark charcoal and deep burgundy modern architectural room, with an empty low-contrast smoky stone work surface occupying the lower quarter, a large soft reflected rectangular window light on a distant textured wall at far right, subtle sculptural vertical wall panels and finely grained material textures, faint warm tungsten bounce from the left, cool silver reflection on the right. Center foreground and center right must stay dark and empty for the separately animated case; top center and left remain quiet negative space for ivory text. Shallow photographic depth of field only in far background, realistic soft photographic lighting and believable atmospheric depth, luxurious tactile materials, desaturated muted palette: near black, stone, deep oxblood burgundy. Dark enough that white serif typography reads clearly. No neon, no glowing orbs, no HUD, no UI, no people, no props, no writing, no logos, no watermark. Wide composition, seamless edge-to-edge scene, no frame, no inset, no border. Editorial product photography, not a futuristic spaceship.

The original generated PNG was preserved. Member portraits and supplied council photos were not generated or edited.

## Partnership worktable study

- Website asset: `dist/assets/strategy-worktable-v1.webp` (1400 × 933, 147,706 bytes).
- Generated with the built-in image-generation tool, then encoded as WebP. This is editorial brand artwork, not an MSC event photograph. No member photography was edited or generated.
- Used as a softly blended illustration beneath the partnership heading. The original generated PNG is retained outside the source checkout.

Final prompt:

> Use case: photorealistic-natural. Asset type: wide editorial website background for a University strategy council's partnerships section. Create a very realistic premium editorial flat-lay photograph of a strategy worktable, on matte off-white ivory drafting paper. One small beautifully detailed aged brushed brass drawing compass with dark metal mechanical joints, a burgundy lacquer pencil, the corner of a dark oxblood leather field notebook, and delicate graphite planning lines on real paper. The objects form a quiet composition concentrated in the lower left quarter, with the right two thirds mostly empty softly textured ivory paper for readable website copy. Subtle hand-drawn route intersections and pencil arcs behind the compass, not a literal map and no data. Natural soft window lighting, delicate believable contact shadows, tactile materials and visible fine paper fibres, sophisticated restrained maroon, charcoal, ivory and muted brass palette. Wide landscape 3:2, camera directly overhead, photoreal editorial still life, not a website screenshot. No writing, letters, logos, numbers, labels, charts, glowing effects, plastic appearance, people, hands, flowers, chess pieces or watermarks. All four image edges are quiet pale ivory paper so the image integrates into a full-bleed paper background.

## Printed section studies

The glossary's three draft sheets are original SVG artwork with real Draft / Test / Refine labels. The closing seal uses the supplied MSC logo crop. `section-art.mjs` applies small scroll-driven offsets only to visible sections and stops when scrolling stops. Reduced motion uses a still composition. No decorative metric or invented event content is introduced.


## October 16 refinement: strategy studies

Generated with the built-in image-generation tool, then optimized to WebP. These are decorative strategy still lifes; no people or real club photography are generated.

- `dist/assets/strategy-archive-v1.webp` — 1536 × 1024, 201,696 bytes. Used in the closing section and as a low-contrast gallery backdrop.
- `dist/assets/strategy-atlas-v1.webp` — 1536 × 1024, 223,334 bytes. Used behind the agenda and subtly in the glossary.
- `dist/assets/decision-study.svg` — original native vector decision flow: question, exploration, test, decision, and iteration.
- `dist/assets/council-network.svg` — original native vector study using all 17 actual members’ initials and their six departments from `content.json`.

### Final archive prompt

Use case: photorealistic-natural. Asset type: full-bleed website background for MSC student strategy council. Wide landscape editorial still life photographed overhead on deep burgundy leather and dark walnut. On the right half only: beautifully carved ivory chess knight and burgundy rook, brass magnifying glass resting on an antique folded map, a closed burgundy leather folio and fountain pen, small cream handwritten evidence notes without readable words. Real tactile surfaces, fine paper fibers, dark elegant detective workbench. Warm side light, controlled rich shadows, cinematic but subtle, no glowing HUD. Left 55 percent very dark empty burgundy negative space for website heading. Objects stay at the right edge with generous breathing room. No people, no logos, no legible text, no collage borders. Premium restrained editorial photography. Landscape 1536x1024.

### Final atlas prompt

Use case: photorealistic-natural. Asset type: pale photographic website background for a strategy council event agenda. Wide landscape overhead editorial photograph of an ivory folded contour map on a warm ivory paper desk. Right half: patinated brass divider compass, a burgundy wooden pencil and three smoked-glass strategy markers on the map. Delicate precise contour lines, tactile cotton paper grain, soft directional afternoon light and believable shadows. Left 60 percent quiet mostly blank warm ivory negative space for dark website text. Sophisticated archival planning study, restrained few objects, subtle composition, no decorative random shapes, no people, no logos, no legible text. Landscape 1536x1024.

## Continuous case textures and motion fields

`dist/assets/case-continuous-v1/` contains 52 transparent, registered copies of the original case poses and 51 displacement PNGs. The PNGs encode forward/backward physical motion, not display artwork. They are generated by depth-testing the original authored 3D case meshes through the exact adjacent camera/hinge matrices. The browser reconstructs intermediate surface positions with `case-renderer.mjs`. No new case image, material or club portrait was generated with AI in this refinement. The existing studio photograph remains the background.

The active set totals 2,851,944 bytes including its manifest. Rebuild with `scripts/package-continuous-case.py` and `scripts/export-case-motion.mjs`.


## Tailored lining and detective reflections

`dist/assets/case-tailored-v2/` was the previous case texture set (3,874,687 bytes including its original-size loading poster). Its 52 poses use an original procedural textile shader depth-tested against the authored case geometry. The maroon lining gains padded diamond channels, soft directional nap, fine weave, recessed seams and subtle thread highlights. Original metal, paper and portrait imagery is retained. Alpha/silhouette, physical paper/dock coordinates, and the 51 motion fields remain unchanged. Rebuild with `python scripts/enhance-case-lining.py` after the continuous-case pipeline.

The detective background was generated with the built-in image-generation tool. It depicts fictional anonymous figures and a fictional eye reflection; it does not depict or replace any council member. The original Operations photo remains separately framed on the page.

- `dist/assets/detective-room-v1.webp` — 1536 × 1024, 123,482 bytes. Full-bleed room/glass layer.
- `dist/assets/detective-mirror-v1.webp` — 2172 × 724, 381,348 bytes, transparent. Independent foreground reflection layer.

### Final room prompt

Use case: photorealistic-natural. Asset type: full-bleed website background for a student strategy council, sophisticated detective and mystery theme. Landscape 1536x1024 cinematic editorial photograph of a quiet shadowy observation room with a dark oxblood wall, smoked glass, tall vertical mirror edges and two indistinct distant human silhouettes in formal coats behind frosted glass, restricted to the far right and lower right. No identifiable faces in this background layer. Fine dust on antique mirror, brushed aged silver edges, very faint warm window reflection, subtle film grain. Left 55 percent is dark quiet empty charcoal-burgundy negative space for ivory website typography. A composition about observation and perspective, premium film-poster photographic lighting, restrained maroon, charcoal, warm ivory and tarnished silver. No crime scene, no weapons, no gore, no horror, no neon, no futuristic HUD, no floating UI, no writing, no logos. The right side must contain enough visible reflected glass and mysterious silhouette detail to be appealing, not featureless black. Full bleed, no border.

### Final mirror prompt

Use case: photorealistic-natural. Asset type: transparent foreground parallax decoration for a sophisticated mystery-themed website. An isolated long horizontal fragment of an antique silver mirror, roughly 3:1 aspect ratio within a landscape image, narrow irregular beveled glass edges. In the mirror, a close cropped reflection of the eyes and eyebrows of one fictional young adult detective, calm, observant and intelligent, realistic skin pores and glistening eyes, framed from brow to upper nose only. Mostly desaturated, maroon and warm silver color grade, moody side light, believable antique mirror tarnish and a few fine scratches, delicate reflected window gleam. Elegant cinematic mystery, not horror, not a medical image. The mirror is slightly tilted clockwise 5 degrees. Object entirely visible, on a genuinely transparent background, with a soft contact shadow; no hands, no complete face, no floating text, no labels, no collage, no logos, no watermark.

## Red-thread board and refined chess replacement

The previous generated eye mirror and observation-room images are no longer referenced by the page. The current evidence board is original native Canvas artwork: twelve pinned notes, cotton-thread shadows and highlights, fixed connections, and a single shaded pointer-following pushpin where all twelve strands meet. Its labels refer to the council’s actual departments and strategy working notes. No new generated image or photographic claim is made.

`dist/assets/chess-board-gallery-v7.webp` is a transparent 1200 × 1000 native Mesa EGL render of the exact current council meshes, real finish maps, 17 member pieces and eight unassigned pawn slots. The same model and procedural ivory, lacquer and wood textures appear in the interactive browser renderer. This native material study/fallback is not a browser screenshot. Export with `scripts/export-chess.mjs`; render with `scripts/render-council-native.py`.

The user-supplied October 16 chess reference informed classic turned profiles, gold crowns/collars and small perimeter marquetry. The cabinet is deliberately slim; finishes remain MSC oxblood and ivory. The reference photograph is not displayed or embedded in the site. The interactive mesh and matching native fallback use the same geometry.

## Tufted leather v3 and satin chess v4

`dist/assets/case-tufted-v3/` is the active case material pass. An original native shader creates burgundy leather with rounded padded diamonds, tuft buttons, gathered folds, tiny grain and restrained satin highlights, inspired by the user’s October 16 upholstery screenshot. This is geometry-registered artwork, with the retained case shape, metalwork and paper. The reference search screenshot is not displayed or used as a stock texture. All 51 geometry motion fields are identical to the preceding film.

`dist/assets/chess-board-gallery-v7.webp` is the native render fallback matching the updated interactive set: all piece gold is replaced by matching ivory/oxblood; dotted perimeter inlays are removed, and board highlights are softened. The thin continuous board fillets remain. No new generated image is used.

## Carved council set v5

The latest native chess fallback matches six newly authored 3D sculptures in `chess-pieces.mjs`. The user’s October 16 carved-chess reference informs the smooth turned and lightly fluted profiles, hollow/scalloped crowns, cut mitre and continuous knight form. The reference photograph is not embedded or displayed. Materials stay ivory and maroon, without gold on any piece. The board finish, slim proportions and continuous border are retained. All geometry is original code-authored artwork, not a generated stock image.

## Recessed lid v4 and ornate chess v6

`case-recessed-v4` replaces the lid lining with an original, physically recessed insert, including sloped leather returns, rounded welt and inset tufted back panel. The lower case uses the retained tufted source artwork. Original outlines, case size and paper/dock projection remain unchanged; native geometry motion maps are recomputed for the deeper insert.

The chess fallback now matches the more detailed modeled set: leaf-relief base friezes, incised veins, turned and guilloche collars, deeper fluted stems, petal crown details and carved mane/face anatomy. The source reference photograph is not used as an image asset. Ivory/oxblood colors, no gold on pieces, satin board and clean border remain. The selected view is 70 degrees from frontal.

## Anatomical knight and gallery board v7

The new knight mesh is original offline sculpting through smooth anatomical volumes and carved details, meshed by marching tetrahedra in `scripts/sculpt-knight.py`, with shared indexed geometry in `dist/knight-sculpture.mjs`. The bishop’s newly tapered mitre includes physically bounded slit walls/floor, with an orientation chosen for the existing side-view close-up. `dist/assets/chess-board-gallery-v7.webp` is the native Mesa EGL transparent render of the actual current council set. A charcoal/burgundy CSS environment replaces slate blue. No new generated image, stock model or portrait is used.
