import { collection, deleteDoc, doc, orderBy, query, setDoc } from 'firebase/firestore';
import { db, executeQuery, generalAdd, getDocContent } from '@/plugins/firebase';
import { resultError, resultSuccess } from '@/utils/request/_util';
import { doLog } from '@/api/statusChangeLog';
import { addInDetail, NotifyDetailModel } from '@/views/newViews/NotifyList/api/notify-detail';
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
  arriveTime: number;
  status: string;
  taskList: NotifyDetailModel[];
}

export const notifyPath = 'notify';
const ref = collection(db, notifyPath);

export interface NotifyCreateDTO {
  notifyType: NotifyType;
  planArriveDateTime: number;
  customerId?: string;
  files?: string[];
  boxCount: number;
  trayCount: number;
  taskList: any[];
}

export async function createNotify(notifyInfo: NotifyCreateDTO) {
  try {
    const info = {
      containerNo: '',
      containerType: '',
      arrivedCount: 0,
      note: '',
      inStatus: InBoundStatus.Wait,
      outStatus: OutStatus.Wait,
      cashStatus: CashStatus.NotFinish,
      warehouseNote: '',
      totalCount: notifyInfo.boxCount + notifyInfo.trayCount,
    };
    const id = await generalAdd(Object.assign(info, notifyInfo), notifyPath, 'inStatus');
    for (const task of notifyInfo.taskList) {
      await addInDetail(task, id);
    }

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
    await setDoc(doc(ref, id), { status: newStatus }, { merge: true });
    if (warehouseId) {
      await setDoc(doc(ref, id), { warehouseId }, { merge: true });
    }
    await doLog({
      files: [],
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
  };
}

//获取table
export async function getNotifyList() {
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

export enum InBoundStatus {
  All = '全部入库',
  Partial = '部分入库',
  Wait = '等待入库',
}

export enum OutStatus {
  All = '全部出库',
  Partial = '部分出库',
  Wait = '等待出库',
  Stay = '留仓',
}

export enum CashStatus {
  Done = '已结算',
  WaitConfirm = '待确认',
  NotFinish = '未结算',
}

export const notifyStatusList = Object.values(NotifyStatus);

export enum NotifyType {
  Container = '货柜',
  TrayOrBox = '托盘/散货',
}

export const notifyType = Object.values(NotifyType);
