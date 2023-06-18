import { getORListByNames, OperationType } from '@/api/operationType';

export const taskStatusList = [
  '未提交',
  '待审核',
  '未通过',
  '未处理',
  '处理中',
  '已处理',
  '已完成',
];

export enum TaskType {
  Shelves = '上架',
  BoxTransfer = '散货中转',
  AmazonTransfer = 'AMZ托盘转运',
  NormalTrayTransfer = '普通托盘转运',
  BoxFastTransfer = '散货快转',
  OneForSend = '一件代发',
  ChangeLogo = '换标',
  OutBound = '出库',
  Inventory = '盘点',
  Destroy = '销毁',
  Return = '退货',
  InStorageOperation = '库内操作',
}

export const taskTypes: TaskType[] = Object.values(TaskType);

function getTaskTypeOperationKeys(taskType: TaskType) {
  switch (taskType) {
    case TaskType.Shelves:
      return getORListByNames([OperationType.Amount, OperationType.Check, OperationType.OpenBox]);
    case TaskType.BoxTransfer:
      break;
    case TaskType.NormalTrayTransfer:
      break;
    case TaskType.BoxFastTransfer:
      break;
    case TaskType.OneForSend:
      break;
    case TaskType.ChangeLogo:
      break;
    case TaskType.OutBound:
      break;
    case TaskType.Inventory:
      break;
    case TaskType.Destroy:
      break;
    case TaskType.Return:
      break;
    case TaskType.InStorageOperation:
      break;
    case TaskType.AmazonTransfer:
  }
}

export const completedList = ['0%', '25%', '50%', '75%', '100%'];

export const operationalRequirementList = ['认真', '仔细'];
export const linkList = ['www.baidu.com', 'www.bilibili.com'];
