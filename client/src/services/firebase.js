import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCHN1sZKQ6Ul6IcBM0j9PU9z8vmJzpW3eM",
  authDomain: "nagrik-ai-pro.firebaseapp.com",
  projectId: "nagrik-ai-pro",
  storageBucket: "nagrik-ai-pro.firebasestorage.app",
  messagingSenderId: "725459403491",
  appId: "1:725459403491:web:1711b80dc13e578bd9bbd6",
  measurementId: "G-P0VF82X1BJ"
};

let app = null;
let auth = null;
let db = null;
let analytics = null;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  isSupported().then((supported) => {
    if (supported) analytics = getAnalytics(app);
  });
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
