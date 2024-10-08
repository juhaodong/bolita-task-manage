import { orderBy, where } from 'firebase/firestore';
import { NotifyManager, OutStatus } from '@/api/dataLayer/modules/notify/notify-api';
import { initModel } from '@/api/dataLayer/common/GeneralModel';
import { chunk } from 'lodash-es';
import { CashManager } from '@/api/dataLayer/modules/cash/cash';
import { useUserStore } from '@/store/modules/user';
import dayjs from 'dayjs';

export async function getNotifyDetailListByNotify(id) {
  return await NotifyDetailManager.load(null, where('notifyId', '==', id));
}

export async function getNotifyDetailListByOutbound(id) {
  return await NotifyDetailManager.load(null, where('outboundId', '==', id));
}

export async function getReserveItems(filterObj?: any) {
  return await NotifyDetailManager.load(
    filterObj,
    orderBy('arriveTime', 'desc'),
    where('arriveTime', '!=', 0)
  );
}

export const NotifyDetailManager = initModel({
  collectionName: 'testTaskList',
  async init(taskInfo, notifyId, customerId) {
    const userInfo = useUserStore().info;
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
    taskInfo.timeLine = [
      {
        operator: userInfo?.realName,
        detailTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        note: '新建货柜预报',
      },
    ];
    return taskInfo;
  },
  joinManager: {
    key: 'notifyId',
    loader: () => NotifyManager.load(null),
  },
});

export const NotifyDetailMergeManager = initModel({
  collectionName: 'testTaskList',
  init(value): any {
    return value;
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

export async function getDetailListByIdWithSearch(filterObj, ids) {
  const currentTaskList = [];
  const res = chunk(ids, 30);
  for (const idList of res) {
    const result = await NotifyDetailManager.load(filterObj, where('id', 'in', idList));
    currentTaskList.push(result);
  }
  return currentTaskList.flat();
}

export async function getDownProductsDetailListById(ids) {
  return await CashManager.load(null, where('financeContainerId', '==', ids));
}
