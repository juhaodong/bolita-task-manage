import { http } from '@/utils/http/axios';

export type NotifyModel = {
  salesId: string;
  customerId: string;
  status: string;
  planArriveDate: number;
  arriveWarehouseName: string;
  totalCount: number;
  arrivedCount: number;
  deliveryMethod: string;
  arriveMedia: ArriveMediaTypes;
  note: string;
};

//获取table
export function getNotifyList(params) {
  return http.request({
    url: '/notify/list',
    method: 'get',
    params,
  });
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
