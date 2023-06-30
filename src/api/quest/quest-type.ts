import { TaskModel } from '@/api/task/task-types';
import { NotifyModel } from '../notify/notify-api';

export interface BasicModel {
  id?: string;
  customerId: string;
  warehouseId?: string;
  createTimestamp: number;
  note: string;
  files: string[];
}

export interface QuestModel extends BasicModel {
  boxCount: number;
  status: QuestStatus;
  notifyType: QuestNotifyType;
  notifyId?: string;
  notifyInfo?: NotifyModel;
  tasks: TaskModel[];
  completeRate: number;
}

export enum QuestNotifyType {
  Box = '散货',
  Tray = '托盘',
  Container = '货柜',
}

export const questNotifyTypeList = Object.values(QuestNotifyType);
export enum QuestStatus {
  NotSubmit = '待提交',
  WaitForCheck = '待审核',
  CheckRefused = '审核被拒',
  NotArrived = '等待货物到货',
  Arrived = '货物已到货',
  WaitAllTaskCheckPass = '等待所有任务审核通过',
  WaitAllPriceConfirm = '等待确认所有任务的报价',
  WaitOperationComplete = '等待操作完成',
  WaitOutbound = '等待发货',
  WaitLogistic = '等待物流',
  Completed = '已完成',
}
