import { useUserStore } from '@/store/modules/user';
import { collection, doc, query, setDoc } from 'firebase/firestore';
import { db } from '@/store/plugins/firebase';
import { resultOfId } from '@/api/dataLayer/modules/OutboundForecast/OutboundForecast';

export function hasAuthPower(power) {
  const res = useUserStore()?.info?.powerTypeItems.map((it) => it.itemKey);
  return res.includes(power);
}
export const PowerTypeList = 'PowerTypeList';
export async function setPowerType(type, list) {
  return await setDoc(doc(db, PowerTypeList, type), { list });
}

export async function getUserTypePowerList(type) {
  const collectionRef = collection(db, PowerTypeList);
  const res = query(collectionRef);
  return (await resultOfId(res)).find((it) => it.id === type)?.list ?? [];
}

export async function getUserCustomerList() {
  return useUserStore()?.info?.customerIds.split(',') ?? [];
}
