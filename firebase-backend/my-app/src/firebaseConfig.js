// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCg58vVXr2MCMByGSAHBdZvEWNVxu3YzoY",
  authDomain: "orangehackathon-9d5d7.firebaseapp.com",
  projectId: "orangehackathon-9d5d7",
  storageBucket: "orangehackathon-9d5d7.firebasestorage.app",
  messagingSenderId: "534779591637",
  appId: "1:534779591637:web:b71d38dd9836e60fd9db5c",
  measurementId: "G-LQXLPNGGN9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);