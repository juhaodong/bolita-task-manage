import {
  getORListByNames,
  laterFilledInOperationRequirement,
  OperationType,
} from '@/api/operationType';
import { TaskType } from '@/api/task/task-types';

export function getTaskTypeOperationKeys(taskType: TaskType) {
  switch (taskType) {
    case TaskType.NormalTray:
      return getORListByNames([
        OperationType.Load,
        OperationType.SelectBoxOnSku,
        OperationType.TrayOutBound,
        OperationType.ShouldChangeTray,
        OperationType.SelfOutbound,
        OperationType.BoxLabel,
        OperationType.MakeTray,
        OperationType.ChangeOrder,
        OperationType.Other,
        OperationType.OneUseTray,
        OperationType.EuropeStandardTray,
        OperationType.PaperBox,
        OperationType.OtherConsumables,
        OperationType.TakePic,
        OperationType.MakeBoxStrong,
        OperationType.CoverLogo,
        OperationType.OrderCancel,
        OperationType.OtherSpecial,
      ]);
    case TaskType.Transfer:
      return getORListByNames([
        OperationType.Load,
        OperationType.SelectBoxOnSku,
        OperationType.FastOutBound,
        OperationType.TrayOutBound,
        OperationType.ShouldChangeTray,
        OperationType.SelfOutbound,
        OperationType.BoxLabel,
        OperationType.SkuLabel,
        OperationType.MakeTray,
        OperationType.ChangeOrder,
        OperationType.Other,
        OperationType.EuropeStandardTray,
        OperationType.PaperBox,
        OperationType.TakePic,
        OperationType.MakeBoxStrong,
        OperationType.CoverLogo,
        OperationType.OrderCancel,
        OperationType.OtherSpecial,
      ]);
    case TaskType.OneForSend:
      return getORListByNames([
        OperationType.BoxLabel,
        OperationType.SkuLabel,
        OperationType.Other,
        OperationType.PaperBox,
        OperationType.CourierBag,
        OperationType.OtherConsumables,
        OperationType.TakePic,
        OperationType.MakeBoxStrong,
        OperationType.CoverLogo,
        OperationType.Destruction,
        OperationType.OrderCancel,
        OperationType.OtherSpecial,
        OperationType.SingleThingOneOrder,
        OperationType.MultipleThingOneOrder,
        OperationType.TotalPackages,
      ]);
    case TaskType.Return:
      return getORListByNames([
        OperationType.Sort,
        OperationType.TrayStorage,
        OperationType.BoxStorage,
        OperationType.OnShelf,
        OperationType.Check,
        OperationType.SelectBoxOnSku,
        OperationType.TrayOutBound,
        OperationType.ShouldChangeTray,
        OperationType.SelfOutbound,
        OperationType.BoxLabel,
        OperationType.SkuLabel,
        OperationType.MakeTray,
        OperationType.PaperBox,
        OperationType.OtherConsumables,
        OperationType.TakePic,
        OperationType.MakeBoxStrong,
        OperationType.NoLogoSelect,
        OperationType.CoverLogo,
        OperationType.Destruction,
        OperationType.OrderCancel,
        OperationType.OtherSpecial,
      ]);
    case TaskType.AmazonTray:
      return getORListByNames([
        OperationType.Load,
        OperationType.TrayOutBound,
        OperationType.ShouldChangeTray,
        OperationType.BoxLabel,
        OperationType.SkuLabel,
        OperationType.MakeTray,
        OperationType.ChangeOrder,
        OperationType.Other,
        OperationType.EuropeStandardTray,
        OperationType.MakeBoxStrong,
        OperationType.CoverLogo,
        OperationType.OrderCancel,
        OperationType.OtherSpecial,
      ]);
    case TaskType.Reserve:
      return getORListByNames([]);
  }
}

export function getNewORsByTaskType(taskType: TaskType) {
  return getTaskTypeOperationKeys(taskType).filter(
    (it) => !laterFilledInOperationRequirement.includes(it.operationType)
  );
}
export function getLaterORsByTaskType(taskType: TaskType) {
  return getTaskTypeOperationKeys(taskType).filter((it) =>
    laterFilledInOperationRequirement.includes(it.operationType)
  );
}
