import { OperationRequirementModel } from '@/api/operationType';

export enum TaskType {
  Shelves = '上架',
  BoxTransfer = '散货中转',
  AmazonTransfer = 'AMZ托盘转运',
  NormalTrayTransfer = '普通托盘转运',
  BoxFastTransfer = '散货快转',
  OneForSend = '一件代发',
  OutBound = '出库',
  Inventory = '盘点',
  Destroy = '销毁',
  Return = '退货',
  InStorageOperation = '库内操作',
}

export const taskTypes: TaskType[] = Object.values(TaskType);

export enum TaskStatus {
  NotSubmit = '未提交',
  WaitForCheck = '待审核',
  Refused = '未通过',
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
