import { orderBy, where } from 'firebase/firestore';
import { NotifyManager, OutStatus } from '@/api/dataLayer/modules/notify/notify-api';
import { initModel } from '@/api/dataLayer/common/GeneralModel';
import { taskListPath } from '@/api/dataLayer/modules/notify/path';
import { chunk } from 'lodash-es';

export async function getNotifyDetailListByNotify(id) {
  return await NotifyDetailManager.load(null, where('notifyId', '==', id));
}

export async function getReserveItems(filterObj?: any) {
  return await NotifyDetailManager.load(
    filterObj,
    orderBy('arriveTime', 'desc'),

    where('arriveTime', '!=', 0)
  );
}

export const NotifyDetailManager = initModel({
  collectionName: taskListPath,
  async init(taskInfo, notifyId, customerId) {
    taskInfo.arrivedContainerNum = 0;
    taskInfo.arrivedTrayNum = 0;
    taskInfo.instorageContainerNum = 0;
    taskInfo.instorageTrayNum = 0;
    taskInfo.note = '';
    taskInfo.arriveTime = '';
    taskInfo.storagePosition = '';
    taskInfo.notifyId = notifyId;
    taskInfo.customerId = customerId.customerId;
    taskInfo.customerInfo = customerId;
    taskInfo.outStatus = OutStatus.WaitCommand;
    return taskInfo;
  },
  joinManager: {
    key: 'notifyId',
    loader: () => NotifyManager.load(null),
  },
});

export async function getDetailListById(ids) {
  const currentTaskList = [];
  const res = chunk(ids, 30);
  for (const idList of res) {
    const result = await NotifyDetailManager.load(null, where('id', 'in', idList));
    currentTaskList.push(result);
  }
  return currentTaskList.flat();
}
