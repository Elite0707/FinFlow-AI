
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBbv9cbzPDsYbc4ZVWvcTcP0HYq3SEgGZI",
  authDomain: "invoice-app-8f146.firebaseapp.com",
  projectId: "invoice-app-8f146",
  storageBucket: "invoice-app-8f146.firebasestorage.app",
  messagingSenderId: "856377315010",
  appId: "1:856377315010:web:9fc63d18807a9c7101b55b",
  measurementId: "G-05720M5P3S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
