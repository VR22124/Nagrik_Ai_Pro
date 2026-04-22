import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

let app = null;
let auth = null;
let db = null;
let analytics = null;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  (async () => {
    try {
      const supported = await isSupported();
      if (supported) analytics = getAnalytics(app);
    } catch {
      // ignore
    }
  })();
} catch (err) {
  // Silent fallback
}

export { auth, db, analytics };

/**
 * Sign in anonymously if not already signed in.
 * Returns uid or null. Never throws.
 */
export async function signInAnonymouslyIfNeeded() {
  if (!auth) return null;
  try {
    if (auth.currentUser) return auth.currentUser.uid;
    const cred = await signInAnonymously(auth);
    return cred.user.uid;
  } catch (err) {
    // Silent failure
    return null;
  }
}

/**
 * Returns current uid or null.
 */
export function getCurrentUid() {
  return auth?.currentUser?.uid || null;
}

/**
 * Returns a promise that resolves with uid once auth state is ready.
 */
export function waitForAuth() {
  if (!auth) return Promise.resolve(null);
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();
      resolve(user?.uid || null);
    });
  });
}
