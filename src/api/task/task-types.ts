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
  OutBound = '出库',
  Inventory = '盘点',
  Destroy = '销毁',
  Return = '退货',
  InStorageOperation = '库内操作',
}

export const taskTypes: TaskType[] = Object.values(TaskType);
