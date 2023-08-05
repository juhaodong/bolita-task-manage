import { BasicModel } from '@/api/model/common/BasicModel';
import { NotifyDetailModel } from '@/api/notify/notify-detail';
import { NotifyType } from '@/api/notify/notify-api';

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
