import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCpw71cc5KRSksaEENF7MlJSk6DA4vyAhM",
  authDomain: "tts-collection.firebaseapp.com",
  databaseURL: "https://tts-collection-default-rtdb.firebaseio.com",
  projectId: "tts-collection",
  storageBucket: "tts-collection.firebasestorage.app",
  messagingSenderId: "480530260459",
  appId: "1:480530260459:web:cf91d6d84fdb4c0a8679ae",
  measurementId: "G-WERSPH922V"
};

const app = initializeApp(firebaseConfig);

// Export these so we can use them in our components
export const auth = getAuth(app);
export const db = getDatabase(app);
export default app;