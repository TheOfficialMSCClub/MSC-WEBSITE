# MSC Website — independent source

This package contains the complete website assets, backend, database migrations, admin dashboard, analytics and onboarding email integration, together with a standalone deployment setup. It can run without ChatGPT.

**Start here:** [Club ownership, deployment and handover](docs/external-handover.md).

Run `npm ci` and `npm run check` from the `standalone/` folder. [Developer setup](standalone/README.md) explains the source layout. Account creation and production deployment are still required. Email sending stays off until the club configures a verified sender.

No production records, account passwords or API keys are included. Existing records move separately through the authenticated admin migration backup. Keep that backup in restricted club storage, outside this repository.
