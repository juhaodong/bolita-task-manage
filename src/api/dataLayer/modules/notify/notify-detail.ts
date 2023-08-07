import { db, executeQuery } from '@/store/plugins/firebase';
import { collection, deleteDoc, doc, orderBy, query, setDoc, where } from 'firebase/firestore';
import { resultError, resultSuccess } from '@/store/request/_util';
import { doLog } from '@/api/dataLayer/modules/statusChangeLog';
import {
  getNotifyById,
  getNotifyList,
  NotifyStatus,
} from '@/api/dataLayer/modules/notify/notify-api';
import { keyBy } from 'lodash-es';
import { safeParseInt } from '@/store/utils/utils';
import { generalAdd, initModel } from '@/api/dataLayer/common/GeneralModel';

const notifyPath = 'notify';
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

export async function getNotifyDetailList() {
  const notifyDict = keyBy(await getNotifyList(), 'id');
  return (
    await executeQuery(query(collection(db, taskListPath), orderBy('createTimestamp', 'desc')))
  ).map((it) => {
    const n = notifyDict[it.notifyId];
    return {
      ...n,
      ...it,
    };
  });
}

export async function getNotifyDetailListByNotify(id) {
  return await executeQuery(
    query(
      collection(db, taskListPath),
      where('notifyId', '==', id),
      orderBy('createTimestamp', 'desc')
    )
  );
}

const NotifyDetailManager = initModel({
  collectionName: taskListPath,
  async init(taskInfo, notifyId) {
    console.log(notifyId);
    taskInfo.arrivedContainerNum = 0;
    taskInfo.arrivedTrayNum = 0;
    taskInfo.note = '';
    taskInfo.storagePosition = '';
    taskInfo.notifyId;
    taskInfo.customerId = (await getNotifyById(notifyId)).customerId;
    return taskInfo;
  },
});

export async function addInDetail(taskInfo: any, notifyId: string) {
  try {
    await generalAdd(taskInfo, taskListPath);
    return resultSuccess('');
  } catch (e: any) {
    return resultError(e?.message);
  }
}

export async function deleteInDetail(detailId) {
  try {
    await deleteDoc(doc(db, taskListPath, detailId));
    return resultSuccess('');
  } catch (e: any) {
    return resultError(e?.message);
  }
}

export async function changeArriveCountForNotifyTask(
  notifyId: string,
  taskId: string,
  newArriveCount: number,
  note: string,
  files: string[]
) {
  try {
    await setDoc(
      doc(db, notifyPath, notifyId, taskListPath, taskId),
      { arrivedCount: newArriveCount },
      { merge: true }
    );
    const notifyNow = await getNotifyById(notifyId);
    const statusNow = notifyNow.status;
    const arrivedTotalCount = notifyNow.taskList.reduce(
      (sum, i) => sum + safeParseInt(i.arrivedCount ?? '0'),
      0
    );
    await setDoc(
      doc(db, notifyPath, notifyId),
      { arrivedCount: arrivedTotalCount },
      { merge: true }
    );
    let statusLater = statusNow;
    if (arrivedTotalCount == notifyNow.totalCount) {
      statusLater = NotifyStatus.AlreadyArrived;
      await setDoc(
        doc(db, notifyPath, notifyId),
        { status: NotifyStatus.AlreadyArrived },
        { merge: true }
      );
    }
    await doLog({
      files: files,
      logRef: notifyId,
      note: '修改' + taskId + '到货数量为' + newArriveCount + '.备注:' + note,
      toStatus: statusLater,
    });
    return resultSuccess('');
  } catch (e: any) {
    return resultError(e?.message);
  }
}
