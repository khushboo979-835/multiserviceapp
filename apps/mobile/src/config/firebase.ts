import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  initializeAuth,
  // @ts-ignore - getReactNativePersistence is exported by React Native entrypoint in Firebase
  getReactNativePersistence,
  getAuth,
  Auth,
  ConfirmationResult,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Official Firebase Project Credentials for Inisha City Service (Production)
export const firebaseConfig = {
  apiKey: "AIzaSyCb0K9HFwaz55lpxhQWwfER2aLOnoIFPCg",
  authDomain: "inisha-city-service-10f4e.firebaseapp.com",
  projectId: "inisha-city-service-10f4e",
  storageBucket: "inisha-city-service-10f4e.firebasestorage.app",
  messagingSenderId: "411001325943",
  appId: "1:411001325943:web:77cc9dbfc30db6dc747972",
  measurementId: "G-NGGGJZ0BSM",
};

// 1. Singleton Firebase App instance
export const app: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// 2. Initialize Firebase Auth with React Native AsyncStorage persistence
let authInstance: Auth;

try {
  const persistence =
    typeof getReactNativePersistence === "function"
      ? getReactNativePersistence(AsyncStorage)
      : undefined;

  authInstance = initializeAuth(app, {
    persistence,
  });
} catch {
  authInstance = getAuth(app);
}

export const auth: Auth = authInstance;

// 3. Global In-Memory Bridge for active Firebase Phone Auth ConfirmationResult
let activeConfirmationResult: ConfirmationResult | null = null;
let activeVerificationId: string | null = null;

export const setConfirmationResult = (
  result: ConfirmationResult | null,
  verificationId?: string
) => {
  activeConfirmationResult = result;
  if (verificationId) {
    activeVerificationId = verificationId;
  }
};

export const getConfirmationResult = (): ConfirmationResult | null => {
  return activeConfirmationResult;
};

export const getVerificationId = (): string | null => {
  return activeVerificationId;
};

export const clearConfirmationResult = () => {
  activeConfirmationResult = null;
  activeVerificationId = null;
};

export default app;
