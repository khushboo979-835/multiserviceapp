import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { initializeFirestore, getFirestore, Firestore, memoryLocalCache } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

// Production Firebase Configuration for Inisha City Service
export const firebaseConfig = {
  apiKey: "AIzaSyCb0K9HFwaz55lpxhQWwfER2aLOnoIFPCg",
  authDomain: "inisha-city-service-10f4e.firebaseapp.com",
  projectId: "inisha-city-service-10f4e",
  storageBucket: "inisha-city-service-10f4e.firebasestorage.app",
  messagingSenderId: "411001325943",
  appId: "1:411001325943:web:77cc9dbfc30db6dc747972",
  measurementId: "G-NGGGJZ0BSM",
};

// Initialize or reuse singleton Firebase app
export const app: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Use memory caching & auto detect long polling to eliminate unnecessary channel spam
export const db: Firestore = (() => {
  try {
    return initializeFirestore(app, {
      localCache: memoryLocalCache(),
      experimentalAutoDetectLongPolling: true,
    });
  } catch {
    return getFirestore(app);
  }
})();

export const auth: Auth = getAuth(app);

export default app;
