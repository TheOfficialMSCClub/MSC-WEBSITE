# Current MSC website — GitHub-ready export

Verified against ChatGPT Site version 44 on October 24, 2026.
Original source commit: d25b317e18472d6ad3b756e071ae55fc7ca8158c.

## Put it on GitHub

1. Extract this ZIP.
2. Open the extracted MSC-Website folder. Copy its CONTENTS into the ROOT of jaydy005jaydy005/MSC-WEBSITE. Do not add another MSC-Website subfolder. Replace matching files, including .github/workflows/main.yml. GitHub Desktop can commit the entire folder in one operation.
3. In the repository, Settings → Pages → Source must be GitHub Actions.
4. Commit and push to main. The included workflow exports fresh files from public/ on every deployment and publishes them. No dependency installation is needed.
5. Wait for the Actions deployment to succeed, then visit https://jaydy005jaydy005.github.io/MSC-WEBSITE/ . Strategy Summit is at strategy-summit.html.

Uploading the ZIP file itself does not extract or deploy the website.

## What was wrong

The inspected GitHub main commit was 5e1613175ce7a9589abb138aa5e4b859bd1c0338.
Its deployment uploaded dist/ without rebuilding it. That folder was from an older export and had no Strategy Summit HTML page. The top-level public/ already contained the current homepage, Summit HTML/CSS/JavaScript and all 11 summit-route-v9 assets. Of 258 current public files, 257 matched GitHub exactly; the remaining difference was the font licence text. The nested MSC-Website/public copy was older and missing the 11 v9 assets.

The new workflow generates dist/ from public/ before publishing. The export also adjusts links and media URLs for GitHub's /MSC-WEBSITE/ subdirectory and uses explicit HTML page links.

## Local preview

With Node 22 installed, from this folder run:

    PAGES_BASE_PATH=/ node scripts/export-github-pages.mjs
    python3 -m http.server 8000 --directory dist

On Windows PowerShell, set $env:PAGES_BASE_PATH='/' before running the Node command. Open http://localhost:8000/ .

## Functionality

The current design, Strategy Summit mountain animation, photos, chess directory, gallery and browser interactions are included. The original public/ source is preserved. Only the generated GitHub Pages output gets hosting adjustments.

GitHub Pages is static hosting: it cannot run the database, club admin dashboard, analytics collection or automatic email delivery. On this export, letters use the existing Copy letter → Instagram flow; analytics collection and email consent are disabled. The original backend source and standalone/ Cloudflare deployment instructions are included for hosting the full application elsewhere.

The ChatGPT website and GitHub repository were not modified during this comparison.
