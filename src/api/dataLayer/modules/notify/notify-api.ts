import {
  getNotifyDetailListByNotify,
  NotifyDetailManager,
} from '@/api/dataLayer/modules/notify/notify-detail';
import { safeParseInt, safeSumInt } from '@/store/utils/utils';
import { initModel } from '@/api/dataLayer/common/GeneralModel';
import { notifyPath, taskListPath } from '@/api/dataLayer/modules/notify/path';

export const NotifyManager = initModel({
  collectionName: notifyPath,
  init(value, taskList) {
    value.boxCount = safeSumInt(taskList, 'containerNum');
    value.trayCount = safeSumInt(taskList, 'trayNum');
    const info = {
      containerNo: '',
      containerType: '',
      arrivedCount: 0,
      note: '',
      inStatus: InBoundStatus.Wait,
      outStatus: OutStatus.Wait,
      cashStatus: CashStatus.NotFinish,
      warehouseNote: '',
      totalCount: safeParseInt(value.boxCount) + safeParseInt(value.trayCount),
    };
    return Object.assign(info, value);
  },
  cascadeManager: {
    collectionName: taskListPath,
    loader: getNotifyDetailListByNotify,
  },
  async afterAddHook(id, value, taskList) {
    await NotifyDetailManager.massiveAdd(taskList, id, value.customerId);
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
  WaitOperation = '等待操作',
  Wait = '等待出库',
  Cancel = '取消',
  Transfer = '转其他系统',
  Stay = '留仓',
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
