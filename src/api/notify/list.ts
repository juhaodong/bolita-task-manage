import { addDoc, collection, doc, query } from 'firebase/firestore';
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
  taskList: [];
};

export type NotifyTaskModel = {
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

export async function createNotify(notifyInfo: NotifyModel) {
  try {
    console.log(notifyInfo, 'info');
    const { id } = await addDoc(collection(db, notifyPath), notifyInfo);
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
    return resultError(e.message);
  }
}

export async function getNotifyById(id: string) {
  const mainInfo = await getDocContent(doc(db, notifyPath, id));
  return {
    ...mainInfo,
    changeLogs: await checkLog(id),
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
