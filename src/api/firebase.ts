import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

export function FirebaseStart(){
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASURE_ID,
  };

  console.log(import.meta.env.VITE_FIREBASE_API_KEY)
// Initialize Firebase
  const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore
  const db = getFirestore(app);
  console.log(db)
  async function uploadFirebase(){
    try {
      const docRef = await addDoc(collection(db, "users"), {
        first: "Alan",
        middle: "Mathison",
        last: "Turing",
        born: 1912
      });

      console.log("Document written with ID: ", docRef.id);
      return docRef
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }
 //uploadFirebase()
}
