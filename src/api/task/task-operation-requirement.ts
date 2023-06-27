import {
  getORListByNames,
  laterFilledInOperationRequirement,
  OperationType,
} from '@/api/operationType';
import { TaskType } from '@/api/task/task-types';

export function getTaskTypeOperationKeys(taskType: TaskType) {
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
