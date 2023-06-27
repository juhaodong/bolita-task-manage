import { addDoc, collection, doc, query, setDoc } from 'firebase/firestore';
import { db, executeQuery, getDocContent } from '@/plugins/firebase';
import { resultError, resultSuccess } from '../../utils/request/_util';
import { doLog } from '@/api/statusChangeLog';
import { BasicModel } from '@/api/quest/quest-type';
import dayjs from 'dayjs';
import { getTasksForNotify, NotifyDetailModel } from '@/api/notify/notify-detail';

export interface NotifyModel extends BasicModel {
  questId: string;
  arriveMedia: ArriveMediaTypes;
  arrivedCount: number;
  totalCount: number;
  planArriveDateTime: number;
  status: string;
  arriveDetail: ContainerArriveDetail | TrayArriveDetail | BoxArriveDetail;
  sortingLabelCount: string;
  taskList: NotifyDetailModel[];
}

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
const ref = collection(db, notifyPath);

export interface NotifyCreateDTO {
  questId: string;
  arriveMedia: ArriveMediaTypes;
  warehouseId: string;
  totalCount: number;
  planArriveDateTime: number;
  arriveDetail: ContainerArriveDetail | TrayArriveDetail | BoxArriveDetail;
  sortingLabelCount: string;
  customerId?: string;
  files?: string[];
}

export async function createNotify(notifyInfo: NotifyCreateDTO) {
  try {
    const info = {
      files: [],
      questId: '',
      warehouseId: '',
      arrivedCount: 0,
      customerId: '',
      note: '',
      planArriveDateTime: 0,
      sortingLabelCount: '',
      status: NotifyStatus.NotSubmit,
      totalCount: 0,
      taskList: [],
      createTimestamp: dayjs().valueOf(),
    };
    const { id } = await addDoc(collection(db, notifyPath), Object.assign(info, notifyInfo));

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
export async function changeNotifyStatus(id: string, newStatus: NotifyStatus) {
  try {
    const currentModel = await getNotifyById(id);
    await setDoc(doc(ref, id), { status: newStatus }, { merge: true });
    await doLog({
      files: [],
      fromStatus: currentModel.status,
      logRef: id,
      note: '',
      toStatus: newStatus,
    });
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
  return await executeQuery(query(collection(db, notifyPath)));
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

export enum ArriveMediaTypes {
  Container = '货柜',
  Tray = '托盘',
  Box = '散货',
}

export const arriveMedia = Object.values(ArriveMediaTypes);

export function getNeededColumnsByArriveMedia(arriveMedia: ArriveMediaTypes | null) {
  const boxField =
    arriveMedia == ArriveMediaTypes.Box ? [{ title: '物流追踪号', key: 'trackingCode' }] : [];
  const trayField =
    arriveMedia == ArriveMediaTypes.Tray
      ? [
          { title: '托盘号（选填）', key: 'trayCode' },
          { title: '托盘长度', key: 'trayLength' },
          { title: '托盘宽度', key: 'trayWidth' },
          { title: '托盘高度', key: 'trayHeight' },
        ]
      : [];
  return [
    { title: '件数', key: 'count' },
    { title: '分拣码', key: 'sortCode' },
    ...boxField,
    ...trayField,
    { title: '实重', key: 'actualWeight' },
    { title: '体积', key: 'volume' },
    { title: '长', key: 'length' },
    { title: '宽', key: 'width' },
    { title: '高', key: 'height' },
    { title: 'SKU', key: 'sku' },
  ];
}
