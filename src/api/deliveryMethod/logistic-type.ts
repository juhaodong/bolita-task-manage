import { DeliveryMethod } from '@/api/deliveryMethod/index';

export type LogisticModel = {
  logisticType: LogisticType;
  orderDate: number;
  taskId: string | null;
  customerId: string | null;
  warehouseId: string | null;
  fbaDesc: string;
  fbaFile: string;
  poDesc: string;
  poFile: string;
  fbaCode: string;
  boxCount: number;
  trayCount: number;
  deliveryMethod: DeliveryMethod;
  deliveryAddress: string;
  trayInfo: TrayInfoModel;
  totalWeight: string;
  totalVolume: string;
  status: LogisticStatus;
  price: string | null;
  note: string;
};

export enum LogisticStatus {
  NotSubmit = '未提交',
  WaitForCheck = '等待审核',
  CheckRefused = '审核未通过',
  WaitForPrice = '等待报价',
  WaitForPriceConfirm = '等待报价确认',
  PriceRefused = '报价已拒绝',
  WaitForFeedBack = '等待物流人员反馈',
  ReadyToSend = '代发货',
  Sent = '已发货',
  Finished = '已提交POD',
}

export type LogisticPrepareModel = {
  amazonReservationNo: string;
  files: string[];
  orderNo: string;
  pickupDate: number;
};

export type LogisticFeedBackModel = {
  transferTray: string;
  pickupFile: string;
};

export enum TrayType {
  FP = 'FP',
  XP = 'XP',
}

export const trayTypes = Object.values(TrayType);

export type TrayInfoModel = {
  length: string;
  width: string;
  height: string;
  weight: string;
  trayType: TrayType;
};

export enum LogisticType {
  AmazonTray = '亚马逊托盘',
  Box = '散货',
  OtherTray = '其他托盘',
}

export const logisticTypes = Object.values(LogisticType);
