// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // didn't work for me

const firebaseConfig = {
  apiKey: 'AIzaSyAWf69IwAwQ_BR6sh7JYHmYijdkP0jk-Ew',
  authDomain: 'sem2-capstone-daniel-bmi.firebaseapp.com',
  projectId: 'sem2-capstone-daniel-bmi',
  storageBucket: 'sem2-capstone-daniel-bmi.appspot.com',
  messagingSenderId: '251284716959',
  appId: '1:251284716959:web:b1b365c27e7e41031b51aa',
  measurementId: 'G-X04JS888WH',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); // 
