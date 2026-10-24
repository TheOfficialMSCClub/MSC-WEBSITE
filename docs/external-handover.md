# MSC ownership, deployment and annual handover

Prepared October 17, 2026. The club chose to set up club-owned accounts.

## What is ready, and what still needs setup

The independent source package contains the full website and assets, backend, private club office, member/partner enquiries, anonymous analytics, email confirmation/welcome/unsubscribe flows, database migrations and a protected migration export. Its external admin authentication and deployment bundle pass local checks. It has not been deployed outside ChatGPT yet. Production sign-in, actual email delivery and external account permissions still need live verification.

The currently published website stays in place until the new installation is verified. The source ZIP contains no real member records or secrets. It is the deployable system, not a database backup.

## Accounts MSC should own

| Resource | Setup and ownership | Handover record |
| --- | --- | --- |
| Club mailbox | Retain `managementstrategycouncil@gmail.com` as the club contact and recovery channel. Agree who manages recovery. | Record the current custodians and recovery method privately. |
| GitHub organization | Create an organization for MSC and a private `msc-website` repository. Invite at least two executives as organization owners using their own GitHub accounts. | Organization URL, repository URL, owner names, recovery-code location. |
| Cloudflare account | Register a club-controlled account, invite at least two authorized executives with their own logins, and put the Worker, D1 database, Access application and any domain in that account. | Account ID, Worker name, D1 ID, Access team domain/application, admin emails. |
| Domain | Use a club-owned domain if MSC has one. A club-account `workers.dev` hostname can be used to start. Purchase a domain only after the club chooses its name and billing owner. | Registrar, renewal date, billing custodian, DNS access. |
| Resend | Create a club-owned team/account and verify a sending domain. Invite successor administrators as the plan permits. | Sender, domain, account owner and secret-replacement procedure. |
| Private operations storage | Keep member exports, database backups, recovery codes and the current ownership register in restricted club storage. | Storage location and who has access. |

Do not make a personal ChatGPT account or a single outgoing executive’s account the only owner. Use individual administrator invitations rather than circulating a shared password. Keep two continuing administrators through each transition. Provider plan, billing and role limits must be checked during registration; this guide does not promise zero recurring costs.

Registration links: [GitHub organizations](https://github.com/account/organizations/new), [Cloudflare](https://dash.cloudflare.com/sign-up), [Resend](https://resend.com/signup). Registration, email verification, recovery and any billing choice must be completed by an authorized club custodian. Never send passwords, recovery codes or API tokens through a chat.

## 1. Put the independent source in GitHub

Extract `MSC-Website-Source.zip`. Create an empty private `msc-website` repository inside the club organization. From the extracted `MSC-Website` folder:

```sh
git init
git add .
git commit -m "Initial MSC club system"
git branch -M main
git remote add origin https://github.com/YOUR-CLUB-ORG/msc-website.git
git push -u origin main
cd standalone
npm ci
npm run check
```

Replace the organization name with the one the club actually creates. The package has ordinary files and an npm lockfile; it does not rely on the original source repository or ChatGPT build helpers.

## 2. Create the club database and choose the public URL

From `standalone/`:

```sh
npx wrangler login
npx wrangler whoami
npx wrangler d1 create msc-club
```

Confirm that the signed-in account is MSC’s account before creating resources. Record the returned database ID. If your login can access more than one account, set the correct `CLOUDFLARE_ACCOUNT_ID` in the terminal or the non-secret `account_id` in Wrangler config.

Choose the final public origin, such as `https://msc-club.YOUR-CLUB-SUBDOMAIN.workers.dev` or a domain MSC owns. The Worker name in the example config is `msc-club`. For a custom domain, add it to the Worker in Cloudflare after the first deployment. The origin must be exact, HTTPS, and have no trailing slash.

## 3. Configure external admin sign-in

In Cloudflare Zero Trust, create the club’s team domain. Enable **One-time PIN** as a login method. Create **one self-hosted Access application** with all of these public hostname/path entries on the chosen website hostname:

| Path | Why it is protected |
| --- | --- |
| `/admin` | Club office page |
| `/api/club/admin*` | Dashboard, exports, backup and admin actions |
| `/api/club/session` | Admin session check |

Use one application so these paths have the same application audience (AUD). Include `/admin/*` too if the dashboard is later extended with nested pages. Add an **Allow** policy for specific approved MSC email addresses, initially `managementstrategycouncil@gmail.com`, and choose One-time PIN. Do not create an Allow policy for everyone or for all Gmail addresses. Disable the application's Cookie Path Attribute so the signed-in cookie works across these paths. Use a reasonable session duration, such as eight hours.

Copy the application AUD tag and the team domain `https://YOUR-TEAM.cloudflareaccess.com`. Do not protect the entire website/Worker: prospective members must be able to browse and submit introductions without signing in. Use hostname/path-based Access. If account-wide Worker protection is enabled, adjust it so the public routes remain public.

The Worker independently verifies Access JWT signatures, issuer, audience, expiry and approved email. An asserted email header or an old platform identity header cannot grant access. Missing settings fail closed. Keep alternate preview URLs disabled; requests to an alternate hostname cannot read or write the admin API.

Official references: [Access for Workers](https://developers.cloudflare.com/workers/configuration/cloudflare-access/), [application paths](https://developers.cloudflare.com/cloudflare-one/access-controls/policies/app-paths/), [JWT validation](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/), [authorization cookies](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/).

## 4. Write deployment settings and secrets

Still in `standalone/`, substitute actual club values:

```sh
node scripts/configure.mjs --origin=https://YOUR-OFFICIAL-HOST --database-id=YOUR-D1-UUID --team-domain=https://YOUR-TEAM.cloudflareaccess.com --aud=YOUR-APPLICATION-AUD
```

This creates `standalone/wrangler.json`. If it already exists, edit it directly. Add extra approved admin emails to `MSC_ADMIN_EMAILS`, separated by commas, and update the same email list in the Access policy. Commit this non-secret config to the club repository. The original development checkout ignores this local config; use `git add -f standalone/wrangler.json` there if needed. The independent export’s ignore rules allow it to be committed normally.

Create a new random rate-limiting salt in the club password manager (at least 32 random bytes) and paste it into the interactive secret prompt:

```sh
npx wrangler --config wrangler.json secret put MSC_RATE_SALT
npm run db:migrate
npm run deploy:check
npm run deploy
```

Keep `MSC_EMAIL_ENABLED` set to `false` throughout migration. Do not copy secrets from the old host or put secrets in `wrangler.json`, frontend files, GitHub commits or deployment logs. `deploy:check` validates non-secret config and bundles locally; it cannot verify account permissions, Access policies or secrets on the host. A deployment may be needed before setting secrets if Wrangler cannot find the Worker; create/deploy it with email off, then add the salt and redeploy before opening forms to visitors.

The build copies `public/` into generated `.assets/` and rewrites canonical, social-image, structured-data, robots and sitemap URLs to the new public origin. Source files remain editable in `public/`. New traffic remains anonymous and respects the existing opt-out and DNT/GPC controls.

## 5. Move existing records separately

Do not put member data in GitHub or in a public source ZIP. This is a controlled launch step, after the external sign-in works.

1. Sign in to the existing club office at the current site’s `/admin` with the approved club account. Download **migration backup**. Ordinary CSV exports are for working lists; they omit fields required for a full migration.
2. Before the final snapshot, pause writes and disable email on the old host, then deploy those settings. The server supports `MSC_WRITES_PAUSED=true` and `MSC_EMAIL_ENABLED=false`. This pauses form, preference and admin writes with a retry message; keep this window short. Existing reads and the backup remain available.
3. Download the final backup while writes are paused. It includes member and partner details, consent versions, confirmation/unsubscribe tokens, follow-up status, all email-job states and anonymous activity in one transactional snapshot. Temporary abuse-limit hashes are omitted. The dashboard export refuses more than 10,000 rows in any table or a file larger than 12 MiB instead of silently truncating. Larger installations need a full privileged database export before cutover.
4. Store it privately at `backups/msc-migration-backup.json`, outside `public/`. From `standalone/`, prepare SQL:

```sh
node scripts/restore-backup.mjs ../backups/msc-migration-backup.json ../backups/restore.sql
npx wrangler --config wrangler.json d1 execute DB --remote --file ../backups/restore.sql
```

5. Import only into a **fresh, empty database with the schema migrations already applied**. The SQL refuses a database containing club records and never overwrites them. If import fails part way, investigate and create a fresh target database before retrying; do not blindly replay it. No import command sends email.
6. Compare enquiry totals, confirmed and unsubscribed states, follow-up statuses, email-job states and analytics counts. Keep failed/uncertain/sending email jobs for review; do not reset them or replay old sends. Review in-flight jobs against the email provider first.
7. Switch public links/DNS only after the checks below pass. If the public hostname changes, preserve redirects from old confirmation/unsubscribe links to the same path/query on the new host. Old links must use the new database; leaving two independent databases accepting preference changes would lose updates. If no email was ever active on the old host, there are no previously sent onboarding links to redirect. Until cutover succeeds, the original site is the production system.
8. If the launch is postponed, unpause the original host and keep email off until ready. Take a new final snapshot next time. Delete obsolete private exports according to the club’s retention practice.

After migration the new system uses only the club’s external accounts. The temporary old-host sign-in is a one-time migration step, not an ongoing dependency. Once verified, retire the old installation or make it a redirect; do not leave it collecting a second set of enquiries.

## 6. Activate onboarding email

In MSC’s Resend account, verify a domain MSC controls. Set the desired sender (for example `MSC <hello@YOUR-CLUB-DOMAIN>`) as `MSC_EMAIL_FROM` in Wrangler config. Add the provider API key interactively:

```sh
npx wrangler --config wrangler.json secret put RESEND_API_KEY
```

Set `MSC_EMAIL_ENABLED` to `true` only once the sender and key are ready, then deploy. Use a club-controlled test address to submit an opted-in introduction; check delivery, confirmation, the single welcome and unsubscribe. Only address-confirmed, opted-in records appear in the mailing-list export. Existing waiting-for-setup enquiries can receive one confirmation through the admin’s explicit per-person action. No bulk email is sent automatically. Uncertain provider responses need inspection before retrying.

A Gmail mailbox can remain the reply-to/contact address, but it is not a verified custom-domain sending identity for this integration. Do not enable sending with a made-up sender. The optional marketing/newsletter platform can be changed later using the confirmed-only CSV; the current system sends onboarding messages, not campaign newsletters.

## Launch verification

- Public home, chessboard, profiles, welcome and privacy routes load from the external URL. The canonical URL and share image point there too.
- An approved email completes Access sign-in. An unapproved email and a signed-out browser cannot access dashboard data, exports, backup or mutations. The public home and forms remain available without sign-in.
- A test introduction persists after a reload, appears in the admin office, can change follow-up status and can be deleted. Do not turn a test person into a real mailing-list record.
- A tracked test campaign appears in analytics. Opt-out and DNT/GPC prevent tracking.
- If email is activated, the controlled-address confirmation/welcome/unsubscribe sequence succeeds with no repeated send. Otherwise the UI correctly says sending is off.
- The migration totals match and old links/host handling are accounted for. Two club administrators can access the infrastructure and source independently.

## Maintenance and annual handover

Edit members, roles, LinkedIn URLs, events and words in `public/content.json`; run `python3 scripts/sync-content.py` from the repository root, then run the checks and deploy from `standalone/`. Photos, textures and models are ordinary files under `public/assets/`; there is no proprietary export step. The asset build refreshes the final domain metadata after content regeneration.

For maintainers who prefer a button in GitHub, `standalone/deploy-workflow.yml.example` is an optional manual deployment workflow. Copy it to `.github/workflows/deploy.yml`, commit the completed non-secret Wrangler config, create the `production` GitHub environment and store a scoped club Cloudflare API token and account ID as its secrets. Limit that token to the required Worker, asset and D1 deployment access. Runtime email keys remain in Cloudflare secrets. Review the workflow before enabling it; it is not installed or scheduled automatically.

Keep schema changes in new numbered SQL migration files under `drizzle/`. Never edit an already applied migration. Apply migrations deliberately before deploying code that needs them. The optional `../db/schema.ts` documents the original schema; the standalone deploy uses the SQL files and does not require an ORM or the old framework.

For a full external-host database backup, create a restricted `backups/` directory first, choose a new dated filename and run:

```sh
npx wrangler --config wrangler.json d1 export DB --remote --output ../backups/msc-YYYY-MM-DD.sql
```

Keep backups private and verify restoration in a separate database before relying on them. Cloudflare D1 also provides plan-dependent Time Travel recovery; confirm the current retention in the account. References: [D1 export](https://developers.cloudflare.com/d1/wrangler-commands/#d1-export), [migrations](https://developers.cloudflare.com/d1/reference/migrations/), [Time Travel](https://developers.cloudflare.com/d1/reference/time-travel/).

Before each executive transition, update the private register below, invite successors, have them sign in and perform a test deployment/backup, then remove outgoing access. Rotate provider/CI credentials that outgoing administrators could read. Transfer billing, renewal notifications and recovery access too. Adding successors only to the website allowlist does not give them ownership of GitHub, hosting, email or the domain.

| Handover item | Club value / current custodian |
| --- | --- |
| GitHub organization and repository | To be created |
| At least two organization owners | To be assigned |
| Cloudflare account ID and two administrators | To be created / assigned |
| Worker name and public origin | `msc-club` / origin to be selected |
| D1 database ID | To be created |
| Access team domain and application AUD | To be created |
| Approved admin emails | Initially `managementstrategycouncil@gmail.com`; review annually |
| Domain registrar, billing and renewal | To be selected if needed |
| Resend team, sender and billing | To be created / verified |
| Private backup and recovery-code location | To be assigned; do not enter secret contents here |
| Last verified deployment and restore test | To be completed at launch |

The successor needs this repository, club account invitations and the private ownership register. They do not need this conversation or the original creator’s ChatGPT account.
