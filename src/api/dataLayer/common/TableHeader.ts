import { db } from '@/store/plugins/firebase';
import { collection, doc, query, setDoc } from 'firebase/firestore';
import { resultOfId } from '@/api/dataLayer/modules/OutboundForecast/OutboundForecast';

export const TableHeaderList = 'TableHeaderList';

export async function setTableHeader(type, list) {
  return await setDoc(doc(db, TableHeaderList, type), { list });
}

export async function getTableHeader(type) {
  const collectionRef = collection(db, TableHeaderList);
  const res = query(collectionRef);
  return (await resultOfId(res)).find((it) => it.id === type).list ?? [];
}
