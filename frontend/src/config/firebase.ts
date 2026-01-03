import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyC-AGc6z5lHQ1uG5WoBj2TmdjePOcgCO7U",
  authDomain: "hackmate-7488c.firebaseapp.com",
  projectId: "hackmate-7488c",
  storageBucket: "hackmate-7488c.firebasestorage.app",
  messagingSenderId: "338785429760",
  appId: "1:338785429760:web:af2123437b9105a9226be5",
  measurementId: "G-YXH3Y1PV05",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

// ✅ Unified Google Login Function (works on web + mobile)
export const loginWithGoogle = async () => {
  try {
    if (/Mobile|Android|iPhone/i.test(navigator.userAgent)) {
      // Try to get redirect result first (for mobile)
      const redirectResult = await getRedirectResult(auth);
      if (redirectResult) {
        console.log("Google login success (redirect):", redirectResult);
        return redirectResult;
      }

      // If not logged in yet, start redirect flow
      await signInWithRedirect(auth, provider);
      return; // App will reload after redirect
    } else {
      // Desktop → Popup flow
      const popupResult = await signInWithPopup(auth, provider);
      console.log("Google login success (popup):", popupResult);
      return popupResult;
    }
  } catch (error) {
    console.error("Google login error:", error);
    throw error;
  }
};

// In your firebase config file
export const checkRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      console.log("Google login success (redirect):", result);
      return result;
    }
    return null;
  } catch (error) {
    console.error("Redirect result error:", error);
    throw error;
  }
};

