# Visual asset provenance

The generated environment used by the website is `public/assets/hero-studio-v3.webp`.
It was created with the built-in image-generation tool, then encoded as WebP for the site. The case is a separate original Blender render; the chessboard and puzzle use original geometry.

The prompt was:

> Use case: product-mockup. Asset type: full-bleed website hero BACKGROUND PLATE, landscape 16:10. Create a highly photorealistic, elegant, cinematic photography studio environment for a luxury SILVER ALUMINIUM ATTACHE CASE that will be composited later. DO NOT put any case, suitcase, bag, watch, chess piece, computer or main object in the image. Subject is ONLY the empty background environment. A dark charcoal and deep burgundy modern architectural room, with an empty low-contrast smoky stone work surface occupying the lower quarter, a large soft reflected rectangular window light on a distant textured wall at far right, subtle sculptural vertical wall panels and finely grained material textures, faint warm tungsten bounce from the left, cool silver reflection on the right. Center foreground and center right must stay dark and empty for the separately animated case; top center and left remain quiet negative space for ivory text. Shallow photographic depth of field only in far background, realistic soft photographic lighting and believable atmospheric depth, luxurious tactile materials, desaturated muted palette: near black, stone, deep oxblood burgundy. Dark enough that white serif typography reads clearly. No neon, no glowing orbs, no HUD, no UI, no people, no props, no writing, no logos, no watermark. Wide composition, seamless edge-to-edge scene, no frame, no inset, no border. Editorial product photography, not a futuristic spaceship.

The original generated PNG was preserved. Member portraits and supplied council photos were not generated or edited.

## Partnership worktable study

- Website asset: `public/assets/strategy-worktable-v1.webp` (1400 × 933, 147,706 bytes).
- Generated with the built-in image-generation tool, then encoded as WebP. This is editorial brand artwork, not an MSC event photograph. No member photography was edited or generated.
- Used as a softly blended illustration beneath the partnership heading. The original generated PNG is retained outside the source checkout.

Final prompt:

> Use case: photorealistic-natural. Asset type: wide editorial website background for a University strategy council's partnerships section. Create a very realistic premium editorial flat-lay photograph of a strategy worktable, on matte off-white ivory drafting paper. One small beautifully detailed aged brushed brass drawing compass with dark metal mechanical joints, a burgundy lacquer pencil, the corner of a dark oxblood leather field notebook, and delicate graphite planning lines on real paper. The objects form a quiet composition concentrated in the lower left quarter, with the right two thirds mostly empty softly textured ivory paper for readable website copy. Subtle hand-drawn route intersections and pencil arcs behind the compass, not a literal map and no data. Natural soft window lighting, delicate believable contact shadows, tactile materials and visible fine paper fibres, sophisticated restrained maroon, charcoal, ivory and muted brass palette. Wide landscape 3:2, camera directly overhead, photoreal editorial still life, not a website screenshot. No writing, letters, logos, numbers, labels, charts, glowing effects, plastic appearance, people, hands, flowers, chess pieces or watermarks. All four image edges are quiet pale ivory paper so the image integrates into a full-bleed paper background.

## Printed section studies

The glossary's three draft sheets are original SVG artwork with real Draft / Test / Refine labels. The closing seal uses the supplied MSC logo crop. `section-art.mjs` applies small scroll-driven offsets only to visible sections and stops when scrolling stops. Reduced motion uses a still composition. No decorative metric or invented event content is introduced.


## October 16 refinement: strategy studies

Generated with the built-in image-generation tool, then optimized to WebP. These are decorative strategy still lifes; no people or real club photography are generated.

- `public/assets/strategy-archive-v1.webp` — 1536 × 1024, 201,696 bytes. Used in the closing section and as a low-contrast gallery backdrop.
- `public/assets/strategy-atlas-v1.webp` — 1536 × 1024, 223,334 bytes. Used behind the agenda and subtly in the glossary.
- `public/assets/decision-study.svg` — original native vector decision flow: question, exploration, test, decision, and iteration.
- `public/assets/council-network.svg` — original native vector study using all 17 actual members’ initials and their six departments from `content.json`.

### Final archive prompt

Use case: photorealistic-natural. Asset type: full-bleed website background for MSC student strategy council. Wide landscape editorial still life photographed overhead on deep burgundy leather and dark walnut. On the right half only: beautifully carved ivory chess knight and burgundy rook, brass magnifying glass resting on an antique folded map, a closed burgundy leather folio and fountain pen, small cream handwritten evidence notes without readable words. Real tactile surfaces, fine paper fibers, dark elegant detective workbench. Warm side light, controlled rich shadows, cinematic but subtle, no glowing HUD. Left 55 percent very dark empty burgundy negative space for website heading. Objects stay at the right edge with generous breathing room. No people, no logos, no legible text, no collage borders. Premium restrained editorial photography. Landscape 1536x1024.

### Final atlas prompt

Use case: photorealistic-natural. Asset type: pale photographic website background for a strategy council event agenda. Wide landscape overhead editorial photograph of an ivory folded contour map on a warm ivory paper desk. Right half: patinated brass divider compass, a burgundy wooden pencil and three smoked-glass strategy markers on the map. Delicate precise contour lines, tactile cotton paper grain, soft directional afternoon light and believable shadows. Left 60 percent quiet mostly blank warm ivory negative space for dark website text. Sophisticated archival planning study, restrained few objects, subtle composition, no decorative random shapes, no people, no logos, no legible text. Landscape 1536x1024.

## Continuous case textures and motion fields

`public/assets/case-continuous-v1/` contains 52 transparent, registered copies of the original case poses and 51 displacement PNGs. The PNGs encode forward/backward physical motion, not display artwork. They are generated by depth-testing the original authored 3D case meshes through the exact adjacent camera/hinge matrices. The browser reconstructs intermediate surface positions with `case-renderer.mjs`. No new case image, material or club portrait was generated with AI in this refinement. The existing studio photograph remains the background.

The active set totals 2,851,944 bytes including its manifest. Rebuild with `scripts/package-continuous-case.py` and `scripts/export-case-motion.mjs`.


## Tailored lining and detective reflections

`public/assets/case-tailored-v2/` was the previous case texture set (3,874,687 bytes including its original-size loading poster). Its 52 poses use an original procedural textile shader depth-tested against the authored case geometry. The maroon lining gains padded diamond channels, soft directional nap, fine weave, recessed seams and subtle thread highlights. Original metal, paper and portrait imagery is retained. Alpha/silhouette, physical paper/dock coordinates, and the 51 motion fields remain unchanged. Rebuild with `python scripts/enhance-case-lining.py` after the continuous-case pipeline.

The detective background was generated with the built-in image-generation tool. It depicts fictional anonymous figures and a fictional eye reflection; it does not depict or replace any council member. The original Operations photo remains separately framed on the page.

- `public/assets/detective-room-v1.webp` — 1536 × 1024, 123,482 bytes. Full-bleed room/glass layer.
- `public/assets/detective-mirror-v1.webp` — 2172 × 724, 381,348 bytes, transparent. Independent foreground reflection layer.

### Final room prompt

Use case: photorealistic-natural. Asset type: full-bleed website background for a student strategy council, sophisticated detective and mystery theme. Landscape 1536x1024 cinematic editorial photograph of a quiet shadowy observation room with a dark oxblood wall, smoked glass, tall vertical mirror edges and two indistinct distant human silhouettes in formal coats behind frosted glass, restricted to the far right and lower right. No identifiable faces in this background layer. Fine dust on antique mirror, brushed aged silver edges, very faint warm window reflection, subtle film grain. Left 55 percent is dark quiet empty charcoal-burgundy negative space for ivory website typography. A composition about observation and perspective, premium film-poster photographic lighting, restrained maroon, charcoal, warm ivory and tarnished silver. No crime scene, no weapons, no gore, no horror, no neon, no futuristic HUD, no floating UI, no writing, no logos. The right side must contain enough visible reflected glass and mysterious silhouette detail to be appealing, not featureless black. Full bleed, no border.

### Final mirror prompt

Use case: photorealistic-natural. Asset type: transparent foreground parallax decoration for a sophisticated mystery-themed website. An isolated long horizontal fragment of an antique silver mirror, roughly 3:1 aspect ratio within a landscape image, narrow irregular beveled glass edges. In the mirror, a close cropped reflection of the eyes and eyebrows of one fictional young adult detective, calm, observant and intelligent, realistic skin pores and glistening eyes, framed from brow to upper nose only. Mostly desaturated, maroon and warm silver color grade, moody side light, believable antique mirror tarnish and a few fine scratches, delicate reflected window gleam. Elegant cinematic mystery, not horror, not a medical image. The mirror is slightly tilted clockwise 5 degrees. Object entirely visible, on a genuinely transparent background, with a soft contact shadow; no hands, no complete face, no floating text, no labels, no collage, no logos, no watermark.

## Red-thread board and refined chess replacement

The previous generated eye mirror and observation-room images are no longer referenced by the page. The current evidence board is original native Canvas artwork: twelve pinned notes, cotton-thread shadows and highlights, fixed connections, and a single shaded pointer-following pushpin where all twelve strands meet. Its labels refer to the council’s actual departments and strategy working notes. No new generated image or photographic claim is made.

`public/assets/chess-board-gallery-v7.webp` is a transparent 1200 × 1000 native Mesa EGL render of the exact current council meshes, real finish maps, 17 member pieces and eight unassigned pawn slots. The same model and procedural ivory, lacquer and wood textures appear in the interactive browser renderer. This native material study/fallback is not a browser screenshot. Export with `scripts/export-chess.mjs`; render with `scripts/render-council-native.py`.

The user-supplied October 16 chess reference informed classic turned profiles, gold crowns/collars and small perimeter marquetry. The cabinet is deliberately slim; finishes remain MSC oxblood and ivory. The reference photograph is not displayed or embedded in the site. The interactive mesh and matching native fallback use the same geometry.

## Tufted leather v3 and satin chess v4

`public/assets/case-tufted-v3/` is the active case material pass. An original native shader creates burgundy leather with rounded padded diamonds, tuft buttons, gathered folds, tiny grain and restrained satin highlights, inspired by the user’s October 16 upholstery screenshot. This is geometry-registered artwork, with the retained case shape, metalwork and paper. The reference search screenshot is not displayed or used as a stock texture. All 51 geometry motion fields are identical to the preceding film.

`public/assets/chess-board-gallery-v7.webp` is the native render fallback matching the updated interactive set: all piece gold is replaced by matching ivory/oxblood; dotted perimeter inlays are removed, and board highlights are softened. The thin continuous board fillets remain. No new generated image is used.

## Carved council set v5

The latest native chess fallback matches six newly authored 3D sculptures in `chess-pieces.mjs`. The user’s October 16 carved-chess reference informs the smooth turned and lightly fluted profiles, hollow/scalloped crowns, cut mitre and continuous knight form. The reference photograph is not embedded or displayed. Materials stay ivory and maroon, without gold on any piece. The board finish, slim proportions and continuous border are retained. All geometry is original code-authored artwork, not a generated stock image.

## Recessed lid v4 and ornate chess v6

`case-recessed-v4` replaces the lid lining with an original, physically recessed insert, including sloped leather returns, rounded welt and inset tufted back panel. The lower case uses the retained tufted source artwork. Original outlines, case size and paper/dock projection remain unchanged; native geometry motion maps are recomputed for the deeper insert.

The chess fallback now matches the more detailed modeled set: leaf-relief base friezes, incised veins, turned and guilloche collars, deeper fluted stems, petal crown details and carved mane/face anatomy. The source reference photograph is not used as an image asset. Ivory/oxblood colors, no gold on pieces, satin board and clean border remain. The selected view is 70 degrees from frontal.

## Anatomical knight and gallery board v7

The new knight mesh is original offline sculpting through smooth anatomical volumes and carved details, meshed by marching tetrahedra in `scripts/sculpt-knight.py`, with shared indexed geometry in `dist/knight-sculpture.mjs`. The bishop’s newly tapered mitre includes physically bounded slit walls/floor, with an orientation chosen for the existing side-view close-up. `public/assets/chess-board-gallery-v7.webp` is the native Mesa EGL transparent render of the actual current council set. A charcoal/burgundy CSS environment replaces slate blue. No new generated image, stock model or portrait is used.

## Strategy Summit — detailed alpine environment

The current environment is original native 3D source in `scripts/summit-world.mjs`, rendered offline by `scripts/export-summit-route.mjs` and `scripts/render-summit-route.py`. The compact homepage and full Summit page share these assets under `public/assets/summit-route-v9/`.

The surface uses a 900 × 750 terrain grid, layered strata and twelve independently fractured rock meshes, trail scree, 430 sparse winter grass clumps and a cliff shoulder. Each clump has 17 individually curved, seven-segment blades, with irregular widths, heights, lean and occasional modeled seed heads. Twelve rock variants now use 80 × 56 mesh subdivisions, adding finer fractured relief. Props are rooted to the detailed render surface. Trunks have 20 radial segments and modeled fluted bark/buttresses. Five fir variants use actual three-dimensional trunks and radial, irregular bough cards; whole-tree billboards are no longer used. Native slope/grain masks place snow on exposed upward-facing rock surfaces. Wind-worked snow, mineral stone and compacted trail earth have separate multiscale relief. The trail mixes weathered granite with uneven compacted soil rather than extending one rock material unchanged across the path. Texture filtering includes mipmaps and up to 16× anisotropy. A deterministic 128³ coherent scalar noise volume supplies material grain, accumulation variation and atmospheric cloud detail without repeating per-pixel transcendental hash calculations.

Lighting combines a fixed low-angle key, a 4096 × 4096 cast-shadow map, cool hemispheric fill and rough dielectric shading with microfacet mineral/ice highlights. A second camera-space normal/depth pass supplies screen-space contact occlusion. The final resolve cleans thin foliage edges. Conservative bounding-sphere/frustum culling skips offscreen props and bounded terrain tiles in the beauty and normal passes. Terrain tiles retain every original triangle without simplification; all three sample images are pixel-identical with culling enabled, and static cast shadows still include the complete world. Atmospheric depth and a continuous distant mountain range stay consistent throughout the route. The old enlarged panorama image is replaced by a 1000 × 600 native terrain grid covering 2.4 km × 1.4 km. Three warped ridge systems have irregular silhouettes, exposed mineral faces and slope/catchment-based snow gullies, with the final material mask following actual mesh normals and broad accumulation variation. Their normals come from the actual rendered mesh, with a scale-appropriate mineral material to avoid subpixel texture aliasing. A floating-point elevation map supplies twelve adaptive terrain-shadow samples for the distant range. Distant terrain receives a lighter atmospheric haze than near terrain. Only sky and clouds live on the procedural atmosphere dome, which is depth-pinned behind the terrain to avoid far-plane gaps. This is an original imagined landscape, not an MSC event photograph or a recreation of an identified location. No third-party game assets are included.

### Approved animation preserved

The player module is unchanged byte for byte from the approved version. All 241 dense camera poses and all 276 clip camera samples (six routes × 46 frames) are exactly equal to the approved route data, including position, look direction, projection, easing and endpoints. Every journey still reaches its stop in 0.75 seconds, encoded at 60 fps with 46 frames and a duration of 0.766667 seconds. There are no scene crossfades, cuts, mouse tracking, timing footnotes or snow switches.

Movies are rendered at 2560 × 1440 with the edge-aware resolve, preserving 60 fps. Small projected rocks and scree use a conservative projected-size geometry level of detail in films; larger visible rocks retain the full mesh, and static cast shadows and all 4K destination images always use the complete geometry. Arrival images are independently rendered at 3840 × 2160 with 4× multisampling from the same world and exact endpoint cameras. The existing predecoded destination-still handoff is retained, so the resting scene matches the chapter rather than a potentially stale paused video frame. Automatic progression, arrows, reversal, offscreen/hidden pause/resume, focus, reduced motion and failure fallback are retained.

Rebuild (Node plus Python with moderngl, numpy, Pillow; ffmpeg available on PATH):

```sh
node scripts/export-summit-route.mjs /absolute/path/route-world.json
python3 scripts/render-summit-route.py /absolute/path/route-world.json /absolute/path/route-frames
```

All three native source scripts and the rendered media are included in the portable export. Visitors and normal deployments do not need the rendering dependencies.

### Generated materials and exact prompts

The new gneiss material (`granite.webp`, encoded from the original generated PNG) and bough cutout (`branch.png`, preserved unchanged) were created with the built-in image-generation tool. The old distant panorama is retired. The new distant landscape, winter grasses and atmosphere are original code-authored geometry/materials; they do not use a generated replacement picture. Source prompts follow. No member photography was generated or edited.

#### Gneiss material

Use case: photorealistic-natural. Asset type: seamless physically based natural rock albedo material for a cinematic alpine video game environment, 2048x2048 square. Primary request: a high fidelity photogrammetry-style scan of a rugged exposed gray-blue metamorphic gneiss and slate cliff surface. Straight-on orthographic close-up texture filling the entire square, no visible object silhouette or scenery. Beautiful natural fractured mineral strata, diagonal irregular compressed stone layers, coarse jagged laminar plates, dark mineral seams and cracks, small subtle flecks of feldspar and quartz, mottled weathering, very sparse faded pale lichen. Slate gray and charcoal with very subtle cool blue and warm beige minerals, realistic restrained variation. Texture covers about two metres of cliff in real world scale. Uniform diffuse neutral illumination with no cast shadows or directional lighting baked in. Every part is tack sharp, extraordinarily detailed, natural nonrepeating complexity, geological realism, AAA environment art material quality. Must tile seamlessly on all four sides. No snow, no plants, no soil, no round gravel or pebbles, no red stone, no layout panels, no icons, no grid, no labels, no writing, no watermark, no border. This is one diffuse/albedo texture image, not a render of rocks, not a material ball, not a collage, not a multi-map sheet.

#### Fir bough material

Use case: photorealistic-natural. Asset type: one natural alpine fir branch alpha-cutout texture for a professional 3D video game foliage mesh. One single fully visible irregular evergreen fir bough, viewed directly from above, isolated on truly transparent background, no ground or shadows or scenery. The brown woody branch starts at the bottom center and extends upward to the top center, with many fine twig offshoots and densely detailed dark blue-green needles branching to left and right. Roughly triangular overall organic silhouette, wider near bottom-middle, tapering toward the top tip, but not a tree, no trunk. The whole branch is about 80 cm long in real life. Natural asymmetry and gaps between twig clusters, crisp fine needle detail and clean natural alpha edges. A very light fine dusting of snow on some needles, mostly dark evergreen needle color. Neutral soft overcast illumination, no directional or hard lighting baked in. Photogrammetry quality AAA game environment texture, extraordinarily sharp natural realism, no geometric polygons or smooth plastic foliage. Keep all branch tips within the image with generous transparent padding, no crop, no pot, no text, no border, no watermark.


Validation: all 517 camera samples and the player source were compared exactly against the approved version. All twelve encoded first/last frames match their expected 4K stills (worst mean RGB difference after downsampling: 6.893 / 255, including encoding, resolve and sampling differences). Both page players pass duration, reversal, visibility, reduced-motion and arrival tests. The real browser loads all six 2560 × 1440 clips at 60 fps and all three 3840 × 2160 stills, and confirms correct arrival views in all six directions.
