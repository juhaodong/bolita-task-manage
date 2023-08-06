import { db, executeQuery } from '@/plugins/firebase';
import { addDoc, collection, deleteDoc, doc, orderBy, query, setDoc } from 'firebase/firestore';
import { resultError, resultSuccess } from '@/utils/request/_util';
import { doLog } from '@/api/statusChangeLog';
import { getNotifyById, NotifyStatus } from '@/views/newViews/NotifyList/api/notify-api';
import dayjs from 'dayjs';

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

export async function getNotifyTasks() {
  return await executeQuery(
    query(collection(db, taskListPath), orderBy('createTimestamp', 'desc'))
  );
}

export async function getTasksForNotify(notifyId) {
  return await executeQuery(query(collection(db, notifyPath, notifyId, taskListPath)));
}

export async function addInDetail(taskInfo: any, notifyId: string) {
  try {
    taskInfo.arrivedCount = 0;
    taskInfo.note = '';
    taskInfo.storagePosition = '';
    taskInfo.notifyId = notifyId;
    taskInfo.createTimestamp = dayjs().valueOf();
    await addDoc(collection(db, taskListPath), taskInfo);
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
      (sum, i) => sum + parseInt(i.arrivedCount ?? '0'),
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
      fromStatus: statusNow,
      logRef: notifyId,
      note: '修改' + taskId + '到货数量为' + newArriveCount + '.备注:' + note,
      toStatus: statusLater,
    });
    return resultSuccess('');
  } catch (e: any) {
    return resultError(e?.message);
  }
}
