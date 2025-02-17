import { getCollectionNextId } from '@/api/dataLayer/common/GeneralModel';
import { safeSumBy, safeSumInt } from '@/store/utils/utils';
import { collection, doc, getDocs, query, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/store/plugins/firebase';
import dayjs from 'dayjs';
import { NotifyDetailManager } from '@/api/dataLayer/modules/notify/notify-detail';
import { OutPlanStatus } from '@/api/dataLayer/modules/notify/notify-api';
import { useUserStore } from '@/store/modules/user';
import { addOrUpdateTask, getTaskListById } from '@/api/newDataLayer/TaskList/TaskList';
import { addOrUpdateTaskTimeLine } from '@/api/newDataLayer/TimeLine/TimeLine';
import { getOutboundForecastById } from '@/api/newDataLayer/OutboundForecast/OutboundForecast';

export const OutboundForecast = 'OutboundForecast';
export const OutWareHouse = 'OutWareHouse';

export async function addOutboundForecast(list) {
  const currentTaskList = [];
  for (const item of list.outboundDetailInfo) {
    const res = await NotifyDetailManager.getById(item);
    currentTaskList.push(res);
  }
  list.trayNum = safeSumInt(currentTaskList, 'arrivedTrayNum');
  list.containerNum = safeSumInt(currentTaskList, 'arrivedContainerNum');
  list.totalWeight = safeSumBy(currentTaskList, 'weight');
  list.totalVolume = safeSumBy(currentTaskList, 'volume');
  list.createTimestamp = dayjs().valueOf();
  const id = await getCollectionNextId(OutboundForecast, 'OF');
  const purchaseRef = doc(db, OutboundForecast, id);
  await setDoc(purchaseRef, { ...list });
  return id;
}

export async function updateOutboundForecast(id, list) {
  const purchaseRef = doc(db, OutboundForecast, id);
  await updateDoc(purchaseRef, { ...list });
}

export async function getOutboundForecast(filterObj) {
  const collectionRef = collection(db, OutboundForecast);
  const res = query(collectionRef);
  if (!filterObj) {
    return await resultOfId(res);
  } else {
    return (await resultOfId(res)).filter((it) => {
      return Object.keys(filterObj).every((k) => !filterObj[k] || filterObj[k] == it[k]);
    });
  }
}

export async function updateTaskListAfterBookingCar(id) {
  const taskListIds = (await getOutboundForecastById(id)).outboundDetailInfo.split(',');
  const userInfo = useUserStore().info;
  for (const taskId of taskListIds) {
    const res = await getTaskListById(taskId);
    await addOrUpdateTaskTimeLine({
      useType: 'normal',
      bolitaTaskId: taskId,
      operator: userInfo?.realName,
      detailTime: dayjs().valueOf(),
      note: '完成订车',
    });
    res.inStatus = '已定车';
    res.inventoryId = res.inventory.id;
    res.customerId = res.customer.id;
    await addOrUpdateTask(res);
  }
}

export async function updateTaskListAfterBookingCarWithInfo(id, info) {
  console.log(info, 'info');
  const taskListIds = (await getOutboundForecastById(id)).outboundDetailInfo.split(',');
  const userInfo = useUserStore().info;
  for (const taskId of taskListIds) {
    const res = await getTaskListById(taskId);
    await addOrUpdateTaskTimeLine({
      useType: 'normal',
      bolitaTaskId: taskId,
      operator: userInfo?.realName,
      detailTime: dayjs().valueOf(),
      note: '完成订车',
    });
    res.ref = info.REF;
    res.outBoundTime =
      dayjs(parseFloat(info.reservationGetProductTime)).format('YYYY-MM-DD') +
      ' ' +
      info.reservationGetProductDetailTime; // 预计取货时间
    res.inStatus = '已定车';
    res.inventoryId = res.inventory.id;
    res.customerId = res.customer.id;
    await addOrUpdateTask(res);
  }
}

export async function updateTaskListAfterOfferPriceCar(id, priceInfo) {
  const taskListIds = (await getOutboundForecastById(id)).outboundDetailInfo.split(',');
  const userInfo = useUserStore().info;
  for (const taskId of taskListIds) {
    const res = await getTaskListById(taskId);
    await addOrUpdateTaskTimeLine({
      useType: 'normal',
      bolitaTaskId: taskId,
      operator: userInfo?.realName,
      detailTime: dayjs().valueOf(),
      note: '完成报价',
    });
    res.inStatus = '已报价';
    res.inventoryId = res.inventory.id;
    res.customerId = res.customer.id;
    res.bookingCarTime = dayjs().format('YYYY-MM-DD');
    res.REF = priceInfo.REF;
    res.costPrice = priceInfo.costPrice;
    res.inStatus = priceInfo.inStatus;
    res.suggestedPrice = priceInfo.suggestedPrice;
    res.waitPrice = priceInfo.waitPrice;
    await addOrUpdateTask(res);
  }
}

export async function updateTaskListConfirmOut(id) {
  const taskListIds = (await getOutboundForecastById(id)).outboundDetailInfo;
  for (const taskId of taskListIds) {
    await NotifyDetailManager.massiveUpdate([
      {
        confirmOutTime: dayjs().format('YYYY-MM-DD'),
        inStatus: OutPlanStatus.AlreadyOut,
        id: taskId,
      },
    ]);
  }
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
