import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDKCeoImu_RPtz-apxVB6qTWAEvnbnaD98",
  authDomain: "satartup-news.firebaseapp.com",
  projectId: "satartup-news",
  storageBucket: "satartup-news.firebasestorage.app",
  messagingSenderId: "845570692273",
  appId: "1:845570692273:web:ac0a64fab241189de53e90",
  measurementId: "G-PMLLSRSW2L",
};

const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: "select_account",
});
