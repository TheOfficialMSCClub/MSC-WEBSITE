# MSC outside ChatGPT

This is a standalone Cloudflare Worker application. It serves the existing MSC website and assets, persists club records in a club-owned D1 database, uses Cloudflare Access for approved admins, and sends optional onboarding emails through a club-owned Resend account. It does not need ChatGPT hosting, a ChatGPT subscription, ChatGPT sign-in, Sites build tools, or connected ChatGPT apps to run.

**Status:** the export and local deployment checks are ready. No external accounts, database, domain, production secrets, email sender or deployment have been created. The current website remains live while these are set up. No real member data or credentials are inside the source ZIP.

Start with [the ownership and deployment guide](../docs/external-handover.md). The source ZIP has this same folder layout; run the commands below from `standalone/`.

```sh
npm ci
npm run check
```

After the club creates its accounts, `scripts/configure.mjs` writes the non-secret settings into `wrangler.json`. See the guide for the required values, Access policies, secrets, database migration and launch sequence. `npm run deploy:check` validates settings and bundles without publishing. `npm run deploy` publishes to the authenticated Cloudflare account. No deployment command runs automatically.

## Project map

| Location | Purpose |
| --- | --- |
| `../public/` | Website, text, photos, 3D pieces, textures, fonts and browser code |
| `../public/content.json` | Council, event and club content |
| `../scripts/sync-content.py` | Regenerates embedded content after edits |
| `worker.mjs` | HTTP routes, origin enforcement and static assets |
| `auth.mjs` | Verified Cloudflare Access JWT authentication |
| `../server/club.mjs` | Enquiries, analytics, admin actions and email onboarding |
| `../server/backup.mjs` | Protected migration snapshot and safe SQL conversion |
| `../drizzle/*.sql` | Versioned database schema migrations |
| `scripts/restore-backup.mjs` | Prepares a migration backup for an empty D1 database |
| `scripts/build-assets.mjs` | Copies assets and updates canonical/share/sitemap URLs for the club’s origin |

Build output, dependencies, private backups and runtime secrets are excluded from source control. Commit `wrangler.json` in the club repository: its IDs, origin and approved email list are configuration, not credentials. Keep actual salts, API keys and Cloudflare deployment tokens out of source.

The shared server still includes a compatibility adapter for the existing hosted site. The standalone Worker supplies its own authenticator and removes platform identity headers; it never uses that adapter to authorize an external request.
