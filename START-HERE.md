# MSC website source

This export matches published version 24 (commit 16017ba68baa5e7c9cd9401b77b81b664a589b3d).

Live website: https://msc-council.jaydenli-epic.chatgpt.site

## Run locally

From the MSC-Website folder, run:

```sh
python3 -m http.server 8000 --directory dist
```

Then open http://localhost:8000. Use a local web server rather than double-clicking index.html, because the site loads modules and JSON. No installation, build step, API key or database is required.

## Main files

- dist/index.html: page structure and static copy
- dist/msc-editorial.css: newest design layer, loaded last
- dist/content.json: members, events, glossary and gallery content
- dist/app.js: navigation, search, filters, dialogs and gallery
- dist/hero-film.mjs: briefcase sequence
- dist/puzzle-scene.mjs: puzzle interaction
- dist/detective-scene.mjs: suspect board
- dist/chess-scene.mjs: chess directory
- dist/assets/: all images and animation frames, including retained earlier versions
- scripts/: source render/export scripts and scene checks
- README.md: detailed implementation notes

The supplied club photographs are original assets. Preserve all content, roles, member names and interactive functionality when editing. Deployment identity, Git history and credentials are excluded.
