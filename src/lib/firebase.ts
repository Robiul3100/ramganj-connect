/**
 * Firebase Cloud Messaging integration.
 * 
 * HOW TO SET UP:
 * 1. Create a Firebase project at https://console.firebase.google.com
 * 2. Enable Cloud Messaging
 * 3. Get your web app config and paste values below
 * 4. Get your Server Key from Project Settings > Cloud Messaging
 * 5. Add FCM_SERVER_KEY as a secret in Lovable Cloud
 * 
 * All keys below are PUBLISHABLE client-side keys (safe to commit).
 * The Server Key is stored securely in backend secrets.
 */

// ============================================================
// REPLACE THESE VALUES WITH YOUR FIREBASE PROJECT CONFIG
// ============================================================
export const firebaseConfig = {
  apiKey: "AIzaSyD7u0j2ZAw8scYtQrIwIcACqDuzLdObtx4",
  authDomain: "ramganj-city.firebaseapp.com",
  projectId: "ramganj-city",
  storageBucket: "ramganj-city.firebasestorage.app",
  messagingSenderId: "59033055734",
  appId: "1:59033055734:web:1c927f31afd7409cc857d7",
};

// Your VAPID key from Firebase Console > Project Settings > Cloud Messaging > Web Push certificates
// You need to generate this from Firebase Console > Project Settings > Cloud Messaging > Web Push certificates
export const VAPID_KEY = "";

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
