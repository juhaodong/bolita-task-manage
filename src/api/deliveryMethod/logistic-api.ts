import { collection, query } from 'firebase/firestore';
import { db, executeQuery } from '@/plugins/firebase';

const path = 'logistic';
const ref = collection(db, path);

export async function getLogisticList(params) {
  console.log(params);
  return await executeQuery(query(ref));
}
