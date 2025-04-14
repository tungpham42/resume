// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAQYJbaDDEhM74brGBw65ay40uHLstcjk4",
  authDomain: "resume-builder-42.firebaseapp.com",
  projectId: "resume-builder-42",
  storageBucket: "resume-builder-42.firebasestorage.app",
  messagingSenderId: "953594595015",
  appId: "1:953594595015:web:ed764439d2a4cad15620e2",
  measurementId: "G-HT7BWTJ663",
};

// Initialize Firebaseconst
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
