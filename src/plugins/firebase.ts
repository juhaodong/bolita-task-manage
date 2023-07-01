import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import {
  doc,
  DocumentData,
  getDoc,
  getDocs,
  getFirestore,
  Query,
  QuerySnapshot,
} from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import dayjs from 'dayjs';
import { UploadFileInfo } from 'naive-ui';

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
export const storage = getStorage(app);

export const storageRef = ref(storage, 'bolita');

export async function uploadFile(file, type: string | null = 'image') {
  const name = dayjs().valueOf() + '-' + (type ?? 'no-type') + '/' + file.name;
  console.log(name, '将要上传的文件名字');
  const res = await uploadBytes(ref(storageRef, name), file);
  console.log(res, 'Image Result');
  return await getDownloadURL(ref(storageRef, name));
}

export async function getFileUrlFromFileUpload(file: UploadFileInfo) {
  return await uploadFile(file.file, file.type?.split('/')[1]);
}

export async function getFileListUrl(files?: UploadFileInfo[]) {
  if (!files) {
    return [];
  }
  return await Promise.all(files.map(getFileUrlFromFileUpload));
}

export const analytics = getAnalytics(app);

export async function executeQuery(query: Query<DocumentData>) {
  return getDocContentWithId(await getDocs(query));
}

function getDocContentWithId(docs: QuerySnapshot<DocumentData>): any[] {
  return docs.docs.map(docContent);
}

export async function getDocContent(docRef) {
  return docContent(await getDoc(docRef));
}

export function docContent(doc) {
  return {
    id: doc.id,
    ...doc.data(),
  };
}

export function downloadFile(url) {
  window.open(url, '_blank');
}
const cache: any = {};
export async function getNameById(
  id: string,
  collection: string,
  nameField = 'name'
): Promise<string> {
  const cacheKey = collection + '-' + id;
  if (cache[cacheKey]) {
    return cache[cacheKey];
  } else {
    const res = (await getDocContent(doc(db, collection, id)))?.[nameField] ?? 'no name';
    cache[cacheKey] = res;
    return res;
  }
}
