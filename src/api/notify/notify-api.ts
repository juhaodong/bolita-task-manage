import { addDoc, collection, deleteDoc, doc, orderBy, query, setDoc } from 'firebase/firestore';
import { db, executeQuery, getDocContent } from '@/plugins/firebase';
import { resultError, resultSuccess } from '@/utils/request/_util';
import { doLog } from '@/api/statusChangeLog';

import dayjs from 'dayjs';
import { addNotifyDetail, getTasksForNotify, NotifyDetailModel } from '@/api/notify/notify-detail';
import { BasicModel } from '@/api/model/common/BasicModel';

export interface NotifyModel extends BasicModel {
  notifyType: NotifyType;
  containerNo: string;
  containerSize: string;
  containerType: string;
  arrivedCount: number;
  totalCount: number;
  reserveTime: number;
  planArriveDateTime: number;
  status: string;
  taskList: NotifyDetailModel[];
}

const notifyPath = 'notify';
const ref = collection(db, notifyPath);

export interface NotifyCreateDTO {
  notifyType: NotifyType;
  planArriveDateTime: number;
  customerId?: string;
  files?: string[];
  taskList: NotifyDetailModel[];
}

export async function createNotify(notifyInfo: NotifyCreateDTO) {
  try {
    const info = {
      containerNo: '',
      containerSize: '',
      containerType: '',
      arrivedCount: 0,
      note: '',
      status: NotifyStatus.NotSubmit,
      createTimestamp: dayjs().valueOf(),
      totalCount: notifyInfo.taskList.reduce((sum, i) => sum + parseInt(i.count), 0),
    };
    const { id } = await addDoc(collection(db, notifyPath), Object.assign(info, notifyInfo));
    for (const t of notifyInfo.taskList) {
      await addNotifyDetail(t, id);
    }
    await doLog({
      fromStatus: NotifyStatus.NotSubmit,
      toStatus: NotifyStatus.NotSubmit,
      note: '',
      files: [],
      logRef: id,
    });
    return resultSuccess(id);
  } catch (e: any) {
    return resultError(e?.message);
  }
}
export async function saveNotify(info: NotifyCreateDTO, id: string | null = null) {
  if (!id) {
    return await createNotify(info);
  } else {
    return await updateNotify(info, id);
  }
}
async function updateNotify(info: NotifyCreateDTO, id) {
  const currentInfo = await getNotifyById(id);
  const newData = Object.assign({}, currentInfo, info);
  try {
    await setDoc(doc(ref, id), newData);
    return resultSuccess(id);
  } catch (e: any) {
    return resultError(e?.message);
  }
}

export async function deleteNotify(id) {
  try {
    await deleteDoc(doc(ref, id));
    return resultSuccess(id);
  } catch (e: any) {
    return resultError(e?.message);
  }
}

export async function changeNotifyStatus(
  id: string,
  newStatus: NotifyStatus,
  warehouseId: string | null = null
) {
  try {
    const currentModel = await getNotifyById(id);
    await setDoc(doc(ref, id), { status: newStatus }, { merge: true });
    if (warehouseId) {
      await setDoc(doc(ref, id), { warehouseId }, { merge: true });
    }
    await doLog({
      files: [],
      fromStatus: currentModel.status,
      logRef: id,
      note: '',
      toStatus: newStatus,
    });
    return resultSuccess('');
  } catch (e: any) {
    return resultError(e?.message);
  }
}

export async function getNotifyById(id?: string) {
  if (id == null) {
    return null;
  }
  const mainInfo = await getDocContent(doc(db, notifyPath, id));
  return {
    ...mainInfo,
    taskList: await getTasksForNotify(id),
  };
}

//获取table
export async function getNotifyList(params) {
  console.log(params);
  return await executeQuery(query(collection(db, notifyPath), orderBy('createTimestamp', 'desc')));
}

export enum NotifyStatus {
  NotSubmit = '未提交',
  WaitForCheck = '审核中',
  Refused = '未通过审核',
  WaitFroArrive = '等待到货',
  AlreadyArrived = '已经到货',
  Warning = '异常',
  Canceled = '已取消',
}

export const notifyStatusList = Object.values(NotifyStatus);

export enum NotifyType {
  Container = '货柜',
  TrayOrBox = '托盘/散货',
}

export const notifyType = Object.values(NotifyType);
