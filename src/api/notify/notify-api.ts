import { addDoc, collection, doc, orderBy, query, setDoc } from 'firebase/firestore';
import { db, executeQuery, getDocContent } from '@/plugins/firebase';
import { resultError, resultSuccess } from '@/utils/request/_util';
import { doLog } from '@/api/statusChangeLog';
import { BasicModel } from '@/api/quest/quest-type';
import dayjs from 'dayjs';
import { getTasksForNotify, NotifyDetailModel } from '@/api/notify/notify-detail';
import {
  commonDeliveryFields,
  deliveryMethodSelection,
  FormField,
  formFieldTaskTypeSelection,
} from '@/views/bolita-views/composable/form-field-type';
import { formFieldUnitSelection } from '@/api/model/common/BoxOrTray';
import { formFieldAddressTypeSelection } from '@/api/model/common/AddressType';
import { formFieldTargetCountrySelection } from '@/api/model/common/TargetCountry';
import { formFieldFBACodeSelection } from '@/api/model/common/FBACode';

export interface NotifyModel extends BasicModel {
  arriveMedia: NotifyType;
  arrivedCount: number;
  totalCount: number;
  reserveTime: number;
  planArriveDateTime: number;
  status: string;
  arriveDetail: ContainerArriveDetail | TrayArriveDetail | BoxArriveDetail;
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
  arriveMedia: NotifyType;
  totalCount: number;
  planArriveDateTime: number;
  arriveDetail: ContainerArriveDetail | TrayArriveDetail | BoxArriveDetail;
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

export function getNeededColumnByNotifyType(notifyType: NotifyType | null) {
  return getNeededFieldByNotifyType(notifyType).map((it) => {
    return {
      title: it.label,
      key: it.field,
    };
  });
}

export function getNeededFieldByNotifyType(notifyType: NotifyType | null): any[] {
  const boxField: FormField[] =
    notifyType == NotifyType.TrayOrBox ? [{ label: '快递单号', field: 'trackingCode' }] : [];
  return [
    { label: '分拣标识', field: 'sortCode' },
    ...boxField,
    formFieldUnitSelection,
    { label: '数量', field: 'count' },
    { label: '长', field: 'length' },
    { label: '宽', field: 'width' },
    { label: '高', field: 'height' },
    { label: '实重kg', field: 'actualWeight' },
    { label: '体积', field: 'volume' },
    { label: 'SKU', field: 'sku' },
    formFieldTaskTypeSelection,
    formFieldAddressTypeSelection,
    formFieldTargetCountrySelection,
    { label: '邮编', field: 'postCode' },
    formFieldFBACodeSelection,
    { label: 'PO', field: 'po' },
    ...commonDeliveryFields,
    ...deliveryMethodSelection,
    { label: '操作备注', field: 'operationNote' },
  ];
}
