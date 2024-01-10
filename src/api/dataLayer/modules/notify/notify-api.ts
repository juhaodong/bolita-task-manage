import {
  getNotifyDetailListByNotify,
  NotifyDetailManager,
} from '@/api/dataLayer/modules/notify/notify-detail';
import { initModel } from '@/api/dataLayer/common/GeneralModel';
import { notifyPath, taskListPath } from '@/api/dataLayer/modules/notify/path';
import { safeParseInt } from '@/store/utils/utils';

export const NotifyManager = initModel({
  collectionName: notifyPath,
  init(value, taskList) {
    const totalTrayNumber = taskList.reduce((sum, i) => sum + safeParseInt(i?.trayNum), 0);
    const totalNumber = taskList.reduce((sum, i) => sum + safeParseInt(i?.number), 0);
    const info = {
      arrivedCount: totalTrayNumber + '托' + totalNumber + '箱',
      inStatus: InBoundStatus.Wait,
      outStatus: OutStatus.Wait,
      cashStatus: CashStatus.NotFinish,
    };
    return Object.assign(info, value);
  },
  cascadeManager: {
    collectionName: taskListPath,
    loader: getNotifyDetailListByNotify,
  },
  async afterAddHook(id, value, taskList) {
    await NotifyDetailManager.massiveAdd(taskList, id, value);
  },
});

export enum InBoundStatus {
  All = '全部入库',
  Partial = '部分入库',
  Wait = '等待入库',
}

export enum OutStatus {
  WaitForCheck = '等待审核',
  WaitForPriceConfirm = '等待确认报价',
  All = '全部出库',
  Partial = '部分操作',
  WaitCommand = '等待指令',
  WaitOperation = '等待操作',
  PartialOut = '部分出库',
  Wait = '等待出库',
  Cancel = '取消',
  Transfer = '转其他系统',
  Stay = '留仓',
}

export enum OutAllStatus {
  All = '全部出库',
  NotAll = '其他',
}

export enum CashStatus {
  Done = '已结算',
  WaitConfirm = '待确认',
  NotFinish = '未结算',
}

export enum NotifyType {
  Container = '货柜',
  TrayOrBox = '托盘/散货',
}

export const notifyType = Object.values(NotifyType);
