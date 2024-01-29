import { getCollectionNextId } from '@/api/dataLayer/common/GeneralModel';
import { collection, doc, query, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/store/plugins/firebase';
import { resultOfId } from '@/api/dataLayer/modules/OutboundForecast/OutboundForecast';

export const inboundType = ['卸货费', '分拣费', '散箱入库', '托盘入库', '其他'];
export const outboundType = ['散箱出库', '散箱换单出库', '托盘出库', '自提出库', '其他'];
export const operateType = ['打托费', '大标签费', '小标签费', '清点费', '换单', '其他'];
export const specialOperationType = ['上架费', '装箱', '其他'];
export const expressDelivery = ['DPD', 'DHL', 'GLS', 'UPS'];
export const directDelivery = ['DTM2', 'HAJ1', '90451', 'WRO5'];
export const allDelivery = ['快递', '直送', '卡派', '其他'];

export const SettlementManage = 'SettlementManage';

export async function addSettlement(list) {
  const id = await getCollectionNextId(SettlementManage, 'Cash');
  const purchaseRef = doc(db, SettlementManage, id);
  await setDoc(purchaseRef, { ...list });
}

export async function updateSettlement(id, list) {
  const purchaseRef = doc(db, SettlementManage, id);
  await updateDoc(purchaseRef, { ...list });
}

export async function getSettlement() {
  const collectionRef = collection(db, SettlementManage);
  const res = query(collectionRef);
  return await resultOfId(res);
}

export async function getSettlementById(id) {
  const collectionRef = collection(db, SettlementManage);
  const res = query(collectionRef);
  return (await resultOfId(res)).find((it) => it.id === id);
}
