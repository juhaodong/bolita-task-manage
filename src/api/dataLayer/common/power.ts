import { useUserStore } from '@/store/modules/user';
import { collection, doc, query, setDoc } from 'firebase/firestore';
import { db } from '@/store/plugins/firebase';
import { resultOfId } from '@/api/dataLayer/modules/OutboundForecast/OutboundForecast';
import { getUserById } from '@/api/newDataLayer/User/User';

export function hasAuthPower(power) {
  const res = useUserStore()?.info?.powerTypeItems.map((it) => it.itemKey) ?? [];
  return res.includes(power);
}

export function userType() {
  return (
    useUserStore()?.info?.userType === '管理员' ||
    useUserStore()?.info?.userType === '运营部前端' ||
    useUserStore()?.info?.userType === '运营部后端'
  );
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
  const currentUser = await getUserById(useUserStore()?.info?.id);
  return currentUser.customerIds.split(',');
}
