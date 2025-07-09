// app/lib/firebase.js
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  Timestamp,
  updateDoc,
  doc,
  deleteDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your existing Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAESPyYcMbUS7tTxE0e1rJsSq7fxO2bxB0",
  authDomain: "insane-dashboard-d0eb3.firebaseapp.com",
  projectId: "insane-dashboard-d0eb3",
  storageBucket: "insane-dashboard-d0eb3.appspot.com",
  messagingSenderId: "718219073645",
  appId: "1:718219073645:web:01b2ee3a2237bf62b2c764",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export {
  db,
  collection,
  addDoc,
  Timestamp,
  updateDoc,
  doc,
  deleteDoc,
  query,
  where,
  getDocs,
  auth,
};
