import { OperationRequirementModel } from '@/api/operationType';
import { BasicModel } from '@/api/model/common/BasicModel';

export enum TaskType {
  Transfer = '转运',
  AmazonTray = 'AMZ卡派',
  NormalTray = '普通卡派',
  OneForSend = '一件代发',
  Return = '移仓/退货',
  Reserve = '留仓',
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

export interface TaskModel extends BasicModel {
  notifyId: string;
  sortLabel: string;
  boxNo?: string;
  boxCount: number;
  taskType: TaskType;
  deliveryMethod: string;
  status: TaskStatus;
  operateTime: string;
  deliveryDate: string;
  completionRate: number;
  operationRequirements: OperationRequirementModel[];
  refLink: string;
}
