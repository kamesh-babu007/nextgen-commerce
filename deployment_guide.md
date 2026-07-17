# Firebase App Hosting & Cloud Functions Deployment Guide (2026 Edition)

This guide details the exact terminal commands required to deploy the NextGen Commerce platform. The backend Express API is deployed via Cloud Functions for Firebase, and the Next.js frontend is deployed natively using Firebase App Hosting with GitHub integration.

## 1. Prerequisites
Ensure you have the Firebase CLI installed globally and are authenticated:
```bash
npm install -g firebase-tools
firebase login
firebase use nextgen-commerce-firebase
```

## 2. Deploy the Express API (Cloud Functions)
First, we deploy the backend so we can obtain the public Cloud Function URL.

1. Inject the PostgreSQL Database URL securely using Firebase Secret Manager:
```bash
firebase functions:secrets:set DATABASE_URL
# Paste your Cloud SQL Postgres connection string when prompted.
```

2. Deploy the functions:
```bash
firebase deploy --only functions
```
Once deployed, Firebase will output a URL similar to: `https://api-xyz123-uc.a.run.app`. 
**Copy this URL**. You will need to inject it as an environment variable in the frontend deployment.

## 3. GitHub Repository Initialization
Firebase App Hosting links directly to your GitHub repository for CI/CD.
If you haven't already pushed this code:
```bash
git init
git add .
git commit -m "Initial commit for Firebase App Hosting"
git branch -M main
git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPO>.git
git push -u origin main
```

## 4. Deploy the Next.js Frontend (App Hosting)
We will now use the App Hosting CLI to create a backend linked to our GitHub repo. 
Run the following command at the root of the project:
```bash
firebase apphosting:backends:create
```

You will be prompted via an interactive CLI:
- **Location**: Select an appropriate region (e.g., `us-central1`).
- **GitHub Connection**: Authorize Firebase to access your GitHub repositories and select `<YOUR_USERNAME>/<YOUR_REPO>`.
- **Root Directory**: Confirm the root directory of your app (the CLI will detect `frontend` based on `apphosting.yaml`).
- **Live Deployment**: Confirm that you want it to deploy automatically on push to `main`.

**Critical Configuration Step:** 
During or immediately after the App Hosting setup in the Firebase Console (under the App Hosting tab -> Settings -> Environment Variables), set the following environment variable for the frontend build/runtime:
- **Key**: `NEXT_PUBLIC_API_URL`
- **Value**: `<YOUR_CLOUD_FUNCTION_URL>` (The one you copied in step 2. Do not include `/api` at the end if the Cloud function URL maps to `/api` internally. Wait, the Cloud function handles `/api` inside the Express app, so just set the base URL). 
*Note: Our `next.config.ts` will automatically proxy all frontend `/api/:path*` requests to this backend URL.*

## 5. View Your Live Application
Once the rollout completes (you can monitor this in the Firebase Console under App Hosting), Firebase will provide a public URL (e.g., `https://<random-hash>-<region>.web.app`).

Navigate to this URL to view the live NextGen Commerce platform!
