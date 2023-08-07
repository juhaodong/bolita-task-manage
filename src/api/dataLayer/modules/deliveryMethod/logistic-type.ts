import { DeliveryMethod } from '@/api/dataLayer/modules/deliveryMethod/index';

export type LogisticModel = {
  id: string;
  logisticType: LogisticType;
  orderDate: number;
  taskId?: string;
  customerId?: string;
  warehouseId?: string;
  deliveryMethod: DeliveryMethod;
  otherDeliveryName: string;
  boxCount: number;
  status: LogisticStatus;
  price?: string;
  note: string;
  files: string[];
  feedBackFiles?: string[];
  orderNo?: string;
  pickupDate?: number;
  pickupFile?: string;
  deliveryCompany?: string;
  podFile?: String;
  logisticDetail: LogisticAmazonDetail | LogisticBoxDetail | LogisticOtherTrayDetail;
};

export interface LogisticAmazonDetail {
  fba: string;
  po: string;
  fbaCode: string;
  trayCount: number;
  deliveryAddress: string;
  totalWeight: string;
  transferTray: string;
  amazonReservationNo: string;
}

export interface LogisticBoxDetail {
  fba: string;
  po: string;
  fbaCode: string;
  deliveryAddress: string;
  totalVolume: string;
}

export interface LogisticOtherTrayDetail {
  transferTray: string;
  trayCount: number;
  deliveryAddress: string;
  deliveryNo: string;
  trayInfo: TrayInfoModel;
}

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
  None = '无',
  AmazonTray = '亚马逊托盘',
  Box = '散货',
  OtherTray = '其他托盘',
  DirectSent = '直送/其他',
}

export const logisticTypes = Object.values(LogisticType);
