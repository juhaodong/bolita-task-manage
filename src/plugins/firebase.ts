import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getDocs, getFirestore, Query, DocumentData, QuerySnapshot } from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyChABcKKZVM1BZTvky3xkVl0b3pCLZaTuQ',
  authDomain: 'bolita-task-manage.firebaseapp.com',
  projectId: 'bolita-task-manage',
  storageBucket: 'bolita-task-manage.appspot.com',
  messagingSenderId: '104218141779',
  appId: '1:104218141779:web:2948471b775891a710d2a6',
  measurementId: 'G-Y8K6KSKJHV',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

export async function executeQuery(query: Query<DocumentData>) {
  return getDocContentWithId(await getDocs(query));
}

export function getDocContentWithId(docs: QuerySnapshot<DocumentData>): any[] {
  return docs.docs.map((it) => ({
    id: it.id,
    ...it.data(),
  }));
}
