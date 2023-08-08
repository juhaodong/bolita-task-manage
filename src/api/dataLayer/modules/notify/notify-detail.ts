import { orderBy, where } from 'firebase/firestore';
import { NotifyManager } from '@/api/dataLayer/modules/notify/notify-api';
import { initModel } from '@/api/dataLayer/common/GeneralModel';

const taskListPath = 'taskList';
export type NotifyDetailModel = {
  arrivedCount: number;
  sortCode: string;
  trackingCode: string;
  trayCode: string;
  trayHeight: string;
  trayWidth: string;
  trayLength: string;
  count: number;
  actualWeight: string;
  volume: string;
  height: string;
  length: string;
  width: string;
  sku: string;
  note: string;
  storagePosition: string;
};

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
    taskInfo.arriveTime = 0;
    taskInfo.storagePosition = '';
    taskInfo.notifyId = notifyId;
    taskInfo.customerId = customerId;
    return taskInfo;
  },
  joinManager: {
    key: 'notifyId',
    loader: () => NotifyManager.load(null),
  },
});
