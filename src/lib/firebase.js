import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyAtthgMUSXLC39anuFNqYhtW9akpHfiRnQ',
  authDomain: 'enigma-bae7d.firebaseapp.com',
  databaseURL: 'https://enigma-bae7d-default-rtdb.firebaseio.com',
  projectId: 'enigma-bae7d',
  storageBucket: 'enigma-bae7d.firebasestorage.app',
  messagingSenderId: '743970610575',
  appId: '1:743970610575:web:242ccd7315b65df29e3ffa',
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)
export default app
