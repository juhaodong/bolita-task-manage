import { db, executeQuery } from '@/store/plugins/firebase';
import { collection, orderBy, query, where } from 'firebase/firestore';
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
  return await executeQuery(
    query(
      collection(db, taskListPath),
      where('notifyId', '==', id),
      orderBy('createTimestamp', 'desc')
    )
  );
}

export const NotifyDetailManager = initModel({
  collectionName: taskListPath,
  async init(taskInfo, notifyId) {
    taskInfo.arrivedContainerNum = 0;
    taskInfo.arrivedTrayNum = 0;
    taskInfo.note = '';
    taskInfo.storagePosition = '';
    taskInfo.notifyId = notifyId;
    taskInfo.customerId = (await NotifyManager.getById(notifyId)).customerId;
    return taskInfo;
  },
  joinManager: {
    key: 'notifyId',
    loader: () => NotifyManager.load(null),
  },
});
