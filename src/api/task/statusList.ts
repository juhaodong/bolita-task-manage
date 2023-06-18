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
      return getORListByNames([
        OperationType.Amount,
        OperationType.Check,
        OperationType.OpenBox,
        OperationType.OpenTray,
        OperationType.SkuLabel,
        OperationType.NoLogoSelect,
        OperationType.PaperBox,
        OperationType.OtherConsumables,
        OperationType.Delivery,
      ]);
    case TaskType.BoxTransfer:
      return getORListByNames([
        OperationType.Amount,
        OperationType.Check,
        OperationType.OpenBox,
        OperationType.OpenTray,
        OperationType.SkuLabel,
        OperationType.TakePic,
        OperationType.MakeBoxStrong,
        OperationType.BoxLabel,
        OperationType.SelectBoxOnSku,
        OperationType.PaperBox,
        OperationType.OtherConsumables,
        OperationType.Delivery,
        OperationType.CoverLogo,
      ]);
    case TaskType.NormalTrayTransfer:
      return getORListByNames([
        OperationType.Amount,
        OperationType.Check,
        OperationType.TakePic,
        OperationType.MakeBoxStrong,
        OperationType.PaperBox,
        OperationType.CoverLogo,
        OperationType.SelectBoxOnSku,
        OperationType.TrayAmount,
        OperationType.TraySize,
        OperationType.OneUseTray,
      ]);
    case TaskType.BoxFastTransfer:
      return getORListByNames([
        OperationType.Amount,
        OperationType.Check,
        OperationType.OpenBox,
        OperationType.OpenTray,
        OperationType.SkuLabel,
        OperationType.TakePic,
        OperationType.MakeBoxStrong,
        OperationType.BoxLabel,
        OperationType.PaperBox,
        OperationType.OtherConsumables,
        OperationType.Delivery,
        OperationType.CoverLogo,
      ]);
    case TaskType.OneForSend:
      return getORListByNames([
        OperationType.Amount,
        OperationType.Check,
        OperationType.PaperBox,
        OperationType.CoverLogo,
        OperationType.CourierBag,
        OperationType.OtherConsumables,
        OperationType.TotalPackages,
        OperationType.Delivery,
        OperationType.SingleThingOneOrder,
        OperationType.MultipleThingOneOrder,
      ]);
    case TaskType.OutBound:
      return getORListByNames([
        OperationType.Amount,
        OperationType.TakePic,
        OperationType.MakeBoxStrong,
        OperationType.Delivery,
      ]);
    case TaskType.Inventory:
      return getORListByNames([
        OperationType.Amount,
        OperationType.Check,
        OperationType.BoxLabel,
        OperationType.SkuLabel,
        OperationType.TakePic,
      ]);
    case TaskType.Destroy:
      return getORListByNames([OperationType.Amount, OperationType.Destruction]);
    case TaskType.Return:
      return getORListByNames([
        OperationType.Amount,
        OperationType.Check,
        OperationType.OpenBox,
        OperationType.OpenTray,
        OperationType.BoxLabel,
        OperationType.SkuLabel,
        OperationType.TakePic,
        OperationType.MakeBoxStrong,
        OperationType.NoLogoSelect,
        OperationType.PaperBox,
        OperationType.OtherConsumables,
        OperationType.CoverLogo,
        OperationType.TotalPackages,
      ]);
    case TaskType.InStorageOperation:
      return getORListByNames([OperationType.Amount]);
    case TaskType.AmazonTransfer:
      return getORListByNames([
        OperationType.Amount,
        OperationType.Check,
        OperationType.TakePic,
        OperationType.MakeBoxStrong,
        OperationType.PaperBox,
        OperationType.OtherConsumables,
        OperationType.Delivery,
        OperationType.CoverLogo,
        OperationType.SelectBoxOnSku,
        OperationType.TrayAmount,
        OperationType.TraySize,
      ]);
  }
}

export const completedList = ['0%', '25%', '50%', '75%', '100%'];

export const operationalRequirementList = ['认真', '仔细'];
export const linkList = ['www.baidu.com', 'www.bilibili.com'];
