import {
  NotifyDetailManager,
  NotifyDetailModel,
} from '@/api/dataLayer/modules/notify/notify-detail';
import { BasicModel } from '@/api/dataLayer/fieldDefination/BasicModel';
import { safeParseInt } from '@/store/utils/utils';
import { initModel } from '@/api/dataLayer/common/GeneralModel';

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
export const NotifyManager = initModel({
  collectionName: notifyPath,
  init(value) {
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
  async afterAddHook(id, value) {
    for (const task of value.taskList) {
      await NotifyDetailManager.addInternal(task, id);
    }
  },
});

export enum InBoundStatus {
  All = '全部入库',
  Partial = '部分入库',
  Wait = '等待入库',
}

export enum OutStatus {
  All = '全部出库',
  Partial = '部分出库',
  Wait = '等待出库',
  WaitForCheck = '等待审核',
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