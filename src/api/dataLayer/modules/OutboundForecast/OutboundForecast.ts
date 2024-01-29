import { getCollectionNextId } from '@/api/dataLayer/common/GeneralModel';
import { safeSumBy, safeSumInt } from '@/store/utils/utils';
import { collection, doc, getDocs, query, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/store/plugins/firebase';
import dayjs from 'dayjs';

export const OutboundForecast = 'OutboundForecast';
export const OutWareHouse = 'OutWareHouse';

export async function addOutboundForecast(list) {
  list.trayNum = safeSumInt(list.outboundDetailInfo, 'outBoundTrayNum');
  list.containerNum = safeSumInt(list.outboundDetailInfo, 'outBoundContainerNum');
  list.totalWeight = safeSumBy(list.outboundDetailInfo, 'weight');
  list.totalVolume = safeSumBy(list.outboundDetailInfo, 'volume');
  list.createTimestamp = dayjs().format('YYYY-MM-DD HH:mm:ss');
  const id = await getCollectionNextId(OutboundForecast, 'OF');
  const purchaseRef = doc(db, OutboundForecast, id);
  await setDoc(purchaseRef, { ...list });
}

export async function updateOutboundForecast(id, list) {
  const purchaseRef = doc(db, OutboundForecast, id);
  await updateDoc(purchaseRef, { ...list });
}

export async function getOutboundForecast() {
  const collectionRef = collection(db, OutboundForecast);
  const res = query(collectionRef);
  return await resultOfId(res);
}

export async function getOutboundForecastById(id) {
  const collectionRef = collection(db, OutboundForecast);
  const res = query(collectionRef);
  return (await resultOfId(res)).find((it) => it.id === id);
}

export async function addOutboundForecastByOut(list) {
  const id = await getCollectionNextId(OutWareHouse, 'Out');
  const purchaseRef = doc(db, OutWareHouse, id);
  await setDoc(purchaseRef, { ...list });
}

export async function updateOutboundForecastByOut(id, list) {
  const purchaseRef = doc(db, OutWareHouse, id);
  await updateDoc(purchaseRef, { ...list });
}

export async function getOutboundForecastByOut() {
  const collectionRef = collection(db, OutWareHouse);
  const res = query(collectionRef);
  return await resultOfId(res);
}

export async function resultOfId(query, logLabel = '') {
  const res = (await getDocs(query)).docs.map(contentOfId);
  if (logLabel) {
    console.log(res, logLabel);
  }
  return res;
}

export function contentOfId(doc) {
  return {
    ...doc.data(),
    id: doc.id,
  };
}
