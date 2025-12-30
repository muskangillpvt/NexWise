// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCG_oOWkm3GSqM4yL0Z1iOhnpn8Y5bu7WM",
  authDomain: "finbuddy-877da.firebaseapp.com",
  projectId: "finbuddy-877da",
  storageBucket: "finbuddy-877da.firebasestorage.app",
  messagingSenderId: "951697569043",
  appId: "1:951697569043:web:97e78a7ba9482fea6b16e6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);