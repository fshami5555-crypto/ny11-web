
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB1JKaxsLu_wumhRZA8LiH8Apf3_TOM9hY",
  authDomain: "ny11-f0b16.firebaseapp.com",
  projectId: "ny11-f0b16",
  storageBucket: "ny11-f0b16.firebasestorage.app",
  messagingSenderId: "262657244290",
  appId: "1:262657244290:web:c2c0adb497d4ea780e489b",
  measurementId: "G-JRZ88T8L5K"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
