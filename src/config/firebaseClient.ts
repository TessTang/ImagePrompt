
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
// import { getAuth } from 'firebase/auth'; // Uncomment if auth is needed

// Firebase configuration will be loaded from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate that all config values are present
if (
  !firebaseConfig.apiKey ||
  !firebaseConfig.authDomain ||
  !firebaseConfig.projectId ||
  !firebaseConfig.storageBucket ||
  !firebaseConfig.messagingSenderId ||
  !firebaseConfig.appId
) {
  console.error(
    'Firebase configuration is missing or incomplete. ' +
    'Ensure all NEXT_PUBLIC_FIREBASE_ environment variables are set in your .env.local file (for local development) ' +
    'or in your deployment environment (e.g., GitHub Secrets for GitHub Actions).'
  );
  // Optionally, throw an error or handle this situation as appropriate for your app
  // For client-side code, throwing an error might break the app, so logging is often preferred.
}

// Initialize Firebase
let app;
if (!getApps().length) {
  if (firebaseConfig.apiKey && firebaseConfig.projectId) { // Basic check before initializing
    app = initializeApp(firebaseConfig);
  } else {
    console.warn("Firebase not initialized due to missing configuration.");
  }
} else {
  app = getApp();
}

const db = app ? getFirestore(app) : null; // Conditionally get Firestore
// const auth = app ? getAuth(app) : null; // Uncomment if auth is needed

export { app, db /*, auth */ };

/*
Important Instructions:

1. Create a `.env.local` file in the root of your project (if it doesn't exist).
   DO NOT commit this file to Git. It should be listed in your .gitignore file.

2. Add your Firebase project configuration to `.env.local` like this:
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   Replace "your_..." with your actual Firebase project values.

3. For deploying to GitHub Pages (or other platforms):
   - Set these same environment variables (e.g., `NEXT_PUBLIC_FIREBASE_API_KEY`) in your deployment environment's settings.
   - For GitHub Actions, store them as "Secrets" in your repository settings and then pass them to the build step.
*/
