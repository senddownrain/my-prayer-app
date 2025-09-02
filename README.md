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
| `npm run export-code` | Export project files to `project_code.txt`. |
| `npm run db:seed` | Fill Firestore `items` collection with sample prayers. |
| `npm run db:migrate` | Migrate existing Firestore documents to new format. |

## Demo

The latest deployment is available at [molitwy.web.app](https://molitwy.web.app).

## FAQ

**How do I change the Firebase project?**  
Edit the configuration object in `src/firebase.js` (and in the database scripts) to match your Firebase project.

**Why do I get permission errors when seeding?**  
Check your Firestore security rules and ensure the credentials used by `seed-db.js` and `migration.js` have access.

