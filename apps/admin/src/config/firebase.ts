import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
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

export const db: Firestore = getFirestore(app);
export const auth: Auth = getAuth(app);

export default app;
