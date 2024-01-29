import { cashPath, financeContainerPath, financePath } from '@/api/dataLayer/modules/cash/cash';
import { carpoolPath } from '@/api/dataLayer/modules/logistic/carpool';
import { logisticServicePath } from '@/api/dataLayer/modules/logistic/logistcService';
import { notifyPath, taskListPath } from '@/api/dataLayer/modules/notify/path';
import { outboundPath } from '@/api/dataLayer/modules/OutBoundPlan/outBoundPlan';
import { outboundDetailPath } from '@/api/dataLayer/modules/OutBoundPlan/outboundDetail';
import { collection, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from '@/store/plugins/firebase';
import {
  OutboundForecast,
  OutWareHouse,
} from '@/api/dataLayer/modules/OutboundForecast/OutboundForecast';
import { SettlementManage } from '@/api/dataLayer/common/SettlementType';

export async function clearAllData() {
  const path = [
    cashPath,
    financePath,
    carpoolPath,
    logisticServicePath,
    notifyPath,
    taskListPath,
    outboundPath,
    outboundDetailPath,
    OutboundForecast,
    OutWareHouse,
    financeContainerPath,
    SettlementManage,
  ];
  for (const collectionName of path) {
    const ref = collection(db, collectionName);
    const docs = await getDocs(ref);
    await Promise.all(docs.docs.map((doc) => deleteDoc(doc.ref)));
  }
  console.log('clear OK');
}
