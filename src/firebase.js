import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyA_gzpG2mJL-dxI24WswOnk_bn0kzgotCA",
  authDomain: "studyduel-f6702.firebaseapp.com",
  databaseURL: "https://studyduel-f6702-default-rtdb.firebaseio.com",
  projectId: "studyduel-f6702",
  storageBucket: "studyduel-f6702.firebasestorage.app",
  messagingSenderId: "941536859007",
  appId: "1:941536859007:web:870cc5fe89d2988b70004a"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);