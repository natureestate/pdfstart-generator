// Firebase Configuration และ Initialization
// ไฟล์นี้ใช้สำหรับการตั้งค่าและเชื่อมต่อกับ Firebase services

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBy4f-C66l03f4-ODOO_aGyseaIDmDb7tk",
  authDomain: "ecertonline-29a67.firebaseapp.com",
  projectId: "ecertonline-29a67",
  storageBucket: "ecertonline-29a67.firebasestorage.app",
  messagingSenderId: "457246107908",
  appId: "1:457246107908:web:1008539ce20637935c8851"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);        // Firestore Database
export const auth = getAuth(app);           // Firebase Authentication
export const storage = getStorage(app);     // Firebase Storage

// Export app instance สำหรับใช้งานอื่นๆ
export default app;
