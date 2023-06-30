import {
  getORListByNames,
  laterFilledInOperationRequirement,
  OperationType,
} from '@/api/operationType';
import { TaskType } from '@/api/task/task-types';

export function getTaskTypeOperationKeys(taskType: TaskType) {
  switch (taskType) {
    case TaskType.InBound:
      return getORListByNames([
        OperationType.Amount,
        OperationType.Check,
        OperationType.Unload,
        OperationType.Sort,
        OperationType.Load,
        OperationType.TrayStorage,
        OperationType.BoxStorage,
        OperationType.OnShelf,
        OperationType.NoLogoSelect,
        OperationType.PaperBox,
        OperationType.OtherConsumables,
        OperationType.Delivery,
      ]);
    case TaskType.NormalTray:
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
    case TaskType.Transfer:
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
    case TaskType.AmazonTray:
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
