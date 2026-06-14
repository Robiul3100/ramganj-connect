/**
 * Firebase Cloud Messaging integration.
 *
 * HOW TO SET UP:
 * 1. Create a Firebase project at https://console.firebase.google.com
 * 2. Enable Cloud Messaging
 * 3. Get your web app config and paste values into your .env file
 *    (see .env.example for variable names)
 * 4. Get your VAPID key from Project Settings > Cloud Messaging > Web Push certificates
 * 5. Add FCM_SERVER_KEY as a secret in Supabase Edge Function secrets
 *
 * All keys below are PUBLISHABLE client-side keys (safe to commit).
 * The Server Key is stored securely in backend secrets.
 */

const env = import.meta.env;

export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: env.VITE_FIREBASE_APP_ID || "",
};

// VAPID key is read at runtime from environment variables.
// Generate yours at: Firebase Console > Project Settings > Cloud Messaging > Web Push certificates
export const VAPID_KEY: string = env.VITE_FIREBASE_VAPID_KEY || "";

/**
 * Check if Firebase is configured
 */
export const isFirebaseConfigured = (): boolean => {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId
  );
};