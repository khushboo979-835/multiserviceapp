import { initializeApp, getApps, getApp } from "firebase/app";
// @ts-ignore
import { initializeAuth, getReactNativePersistence, getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

export const firebaseConfig = {
  apiKey: "AIzaSyAmfmsR4Lcsp8OxGq0TDzNyWIC11udopls",
  authDomain: "multiserviceapp-c5084.firebaseapp.com",
  projectId: "multiserviceapp-c5084",
  storageBucket: "multiserviceapp-c5084.firebasestorage.app",
  messagingSenderId: "812091083975",
  appId: "1:812091083975:web:f5339c84968bac73ce02e2",
  measurementId: "G-N3P4WZHY6X"
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth with React Native AsyncStorage persistence
let authInstance: any;
try {
  authInstance = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
} catch (e) {
  authInstance = getAuth(app);
}

export const auth = authInstance;
export const db = getFirestore(app);

// Safe analytics initializer
let analytics: any = null;
if (Platform.OS === "web" && typeof window !== "undefined") {
  try {
    const { getAnalytics, isSupported } = require("firebase/analytics");
    isSupported().then((supported: boolean) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    });
  } catch (e) {
    // Analytics optional in non-browser
  }
}

export { app, analytics };




