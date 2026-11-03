# Firebase Hosting deployment

Repository: `senddownrain/my-prayer-app`
Firebase project: `molitwy`
Live site: https://molitwy.web.app

## One-time setup

1. In Google Cloud Console, select project `molitwy` and open **IAM & Admin → Service Accounts**.
2. Create a dedicated service account for this GitHub workflow. Grant only the roles needed for Firebase Hosting deployment (typically **Firebase Hosting Admin** and **API Keys Viewer**); do not use a personal account key. Follow the [action's service-account guide](https://github.com/FirebaseExtended/action-hosting-deploy/blob/main/docs/service-account.md).
3. Create a JSON key for that service account if organization policy permits. Keep the entire JSON private. Never commit it to Git or paste it in issues or PRs.
4. Open https://github.com/senddownrain/my-prayer-app/settings/secrets/actions, choose **New repository secret**, use name `FIREBASE_SERVICE_ACCOUNT_MOLITWY`, and paste the JSON key as its value.
5. Merge the workflow PR into `main` only when the credential has been configured and you are ready to deploy the current `main` build.

## Behavior

- Pull requests to `main`: run `npm ci` and `npm run build`; no Firebase deployment or credentials are used.
- Pushes to `main` (including merged PRs): build and deploy the `dist` directory to the **live** Firebase Hosting channel.
- **Actions → Firebase Hosting (build and deploy) → Run workflow**: manually deploy the selected branch's build. Choose `main` for normal production deployments.
- If the secret is missing, production deployment fails with a clear message instead of silently publishing.

## Notes

- This workflow deploys **Hosting only**. It does not modify Firestore rules, Firestore data, Firebase Auth, or Cloud Functions.
- `firebase.json` already uses `dist` and the repository's `.firebaserc` selects `molitwy`.
- No test script is defined in `package.json`; the workflow performs a clean install and production build as the existing validation step.
- A GitHub Actions build is not an end-to-end browser test. Check the published page after deployment.
- Prefer workload identity federation for future hardening if your team can configure it in Google Cloud; this initial workflow uses the documented Firebase Hosting action's service-account secret.
