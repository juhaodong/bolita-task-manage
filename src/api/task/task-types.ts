import { OperationRequirementModel } from '@/api/operationType';

export enum TaskType {
  InBound = '入库',
  Transfer = '中转/快转',
  AmazonTray = 'AMZ卡派',
  NormalTray = '普通卡派',
  OneForSend = '一件代发',
  Return = '移仓/退货',
}

export const taskTypes: TaskType[] = Object.values(TaskType);

export enum TaskStatus {
  NotSubmit = '未提交',
  WaitForArrive = '等待到货',
  WaitForCheck = '待审核',
  Refused = '未通过',
  WaitForLogisticPriceConfirm = '等待物流报价',
  NotHandled = '未处理',
  Handling = '处理中',
  Finished = '已处理',
  CompletedConfirmed = '已完成',
  Warning = '异常',
}

export type TaskModel = {
  id?: string;
  customerId: string;
  warehouseId: string;
  questId?: string;
  logisticId?: string;
  sortLabel?: string;
  boxCount: number;
  taskType: TaskType;
  deliveryMethod: string;
  status: TaskStatus;
  operateTime: string;
  deliveryDate: string;
  completionRate: number;
  note: string;
  files: string[];
  operationRequirements: OperationRequirementModel[];
  refLink: string;
};
