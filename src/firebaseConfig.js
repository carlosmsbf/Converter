import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyBMkifT6vDJiney3E5-mSs1Z1eyXhjdpPg",
    authDomain: "converter-3d24d.firebaseapp.com",
    projectId: "converter-3d24d",
    storageBucket: "converter-3d24d.appspot.com",
    messagingSenderId: "852470942662",
    appId: "1:852470942662:web:51a87639c2cd1e705f80c7"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };