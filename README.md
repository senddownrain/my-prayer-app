# My Prayer App

My Prayer App is a Vue 3 + Vuetify progressive web application for viewing and managing Catholic prayers with multiple language versions. Data is stored in Firebase Firestore.

## Requirements
- Node.js 18+
- npm 9+
- Firebase project with Firestore enabled
- Replace Firebase configuration in `src/firebase.js` (and in `seed-db.js`/`migration.js` when using database scripts) with your own project keys.

## Getting Started

```bash
npm install
npm run dev
```

This launches Vite dev server at http://localhost:5173.

## Available Commands

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Start local development server. |
| `npm run build` | Generate production build in `dist/`. |
| `npm run preview` | Preview the production build locally. |
| `npm test` | Run non-network unit tests. |
| `npm run export-code` | Export project files to `project_code.txt`. |
| `npm run db:seed` | **Destructively replaces** Firestore `items` with sample prayers. Requires an explicit confirmation environment variable. |
| `npm run db:migrate` | **Destructively migrates** old Firestore documents. Requires an explicit confirmation environment variable. |

## Demo

The latest deployment is available at [molitwy.web.app](https://molitwy.web.app).

## FAQ

**How do I change the Firebase project?**  
Edit the configuration object in `src/firebase.js` (and in the database scripts) to match your Firebase project.

**Why do I get permission errors when seeding?**  
Check your Firestore security rules and ensure the credentials used by `seed-db.js` and `migration.js` have access.



## Data safety

Always export and verify a Firestore backup before manipulating prayer records.

The maintenance commands are intentionally blocked unless the operator sets
`CONFIRM_DESTRUCTIVE_SEED=YES_DELETE_ALL_MOLITWY_ITEMS` for `db:seed`, or
`CONFIRM_DESTRUCTIVE_MIGRATION=YES_REPLACE_MOLITWY_ITEMS` for `db:migrate`.
These scripts act on the `molitwy` Firebase project. Do **not** run them against
production data without an independently verified recovery plan.

JSON import's **Add** mode skips IDs already found in Firestore.
**Overwrite** mode replaces matching records after confirmation. Imports larger
than 400 records are submitted in several batches and can partially succeed if
a later batch fails. Review `docs/audit-2026-11-04.md` before using it.

## Automatic checks

Pull requests run `npm ci`, `npm test` and `npm run build` in GitHub Actions
without deploying. Pushing to `main` deploys to live Firebase Hosting after
the checks pass and requires the repository's Firebase service-account secret.
