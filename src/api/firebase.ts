import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

export function FirebaseStart(){
  const firebaseConfig = {
    apiKey: '',
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: ""
  };
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
uploadFirebase()
}
