import { addDoc, collection, doc, query, setDoc } from 'firebase/firestore';
import { db, executeQuery, getDocContent } from '@/plugins/firebase';
import { resultError, resultSuccess } from '../../../mock/_util';
import { checkLog, doLog } from '@/api/statusChangeLog';
import dayjs from 'dayjs';

export type NotifyModel = {
  customerId: string;
  arriveMedia: ArriveMediaTypes;
  arriveWarehouseId: string;
  arrivedCount: number;
  totalCount: number;
  planArriveDateTime: number;
  status: string;
  note: string;
  arriveDetail: ContainerArriveDetail | TrayArriveDetail | BoxArriveDetail;
  sortingLabelCount: string;
  taskList: NotifyTaskModel[];
};

export type NotifyTaskModel = {
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
  operationType: string;
  addressType: string;
  targetCountry: string;
  postCode: string;
  fbaCode: string;
  fba: string;
  po: string;
  address: string;
};

export type ContainerArriveDetail = {
  containerNo: string;
  carNo: string;
  containerSize: string;
  containerType: string;
};

export type TrayArriveDetail = {
  traySize: string;
  trayCount: number;
  trayType: string;
  goodsType: string;
  carNo: string;
};

export type BoxArriveDetail = {
  deliveryMethod: string;
};

const notifyPath = 'notify';
const taskListPath = 'taskList';

export async function getTasksForNotify(notifyId) {
  return await executeQuery(query(collection(db, notifyPath, notifyId, taskListPath)));
}

export async function createNotify(notifyInfo: NotifyModel) {
  try {
    const info = {
      arriveWarehouseId: '',
      arrivedCount: 0,
      customerId: '',
      note: '',
      planArriveDateTime: 0,
      sortingLabelCount: '',
      status: '',
      totalCount: 0,
    };
    const { id } = await addDoc(collection(db, notifyPath), Object.assign(info, notifyInfo));

    await Promise.all(
      notifyInfo.taskList.map((it) => addDoc(collection(db, notifyPath, id, taskListPath), it))
    );
    await doLog({
      fromStatus: NotifyStatusList.NotSubmit,
      toStatus: NotifyStatusList.NotSubmit,
      timestamp: dayjs().valueOf(),
      note: '',
      files: [],
      userId: null,
      logRef: id,
    });
    return resultSuccess(id);
  } catch (e: any) {
    return resultError(e?.message);
  }
}

export async function changeArriveCountForNotifyTask(
  notifyId,
  taskId,
  newArriveCount,
  note,
  files
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
      statusLater = NotifyStatusList.AlreadyArrived;
      await setDoc(
        doc(db, notifyPath, notifyId),
        { status: NotifyStatusList.AlreadyArrived },
        { merge: true }
      );
    }
    await doLog({
      files: files,
      fromStatus: statusNow,
      logRef: notifyId,
      note: '修改' + taskId + '到货数量为' + newArriveCount + '.备注:' + note,
      timestamp: dayjs().valueOf(),
      toStatus: statusLater,
      userId: null,
    });
    return resultSuccess('');
  } catch (e: any) {
    return resultError(e?.message);
  }
}

export async function getNotifyById(id: string) {
  const mainInfo = await getDocContent(doc(db, notifyPath, id));
  return {
    ...mainInfo,
    changeLogs: await checkLog(id),
    taskList: await getTasksForNotify(id),
  };
}

//获取table
export async function getNotifyList(params) {
  console.log(params);
  return await executeQuery(query(collection(db, notifyPath)));
}

export enum NotifyStatusList {
  NotSubmit = '未提交',
  InAuth = '审核中',
  WaitForEdit = '待修改',
  WaitFroArrive = '等待到货',
  AlreadyArrived = '已经到货',
  Warning = '异常',
  Canceled = '已取消',
}

export const notifyStatusList = Object.values(NotifyStatusList);

export enum ArriveMediaTypes {
  Container = '货柜',
  Tray = '托盘',
  Box = '散货',
  ClaimGood = '认领件',
}

export const arriveMedia = Object.values(ArriveMediaTypes);
