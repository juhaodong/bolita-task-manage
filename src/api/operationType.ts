import { deliveryMethods } from '@/api/deliveryMethod';

export enum SelectBoxBase {
  SKU = 'SKU挑箱',
  Mai = '箱唛挑箱',
}
export const selectBoxBases = Object.values(SelectBoxBase);

export enum OperationType {
  Amount = '数量',
  Check = '清点',
  OpenBox = '拆箱',
  OpenTray = '拆托',
  BoxLabel = '箱唛标签（含A4纸）',
  SkuLabel = 'SKU标签',
  SelectBoxOnSku = 'SKU挑箱/箱唛挑箱',
  TrayAmount = '托盘数',
  OneUseTray = '一次性托盘',
  TraySize = '托盘尺寸',
  TakePic = '拍照',
  MakeBoxStrong = '箱体加固',
  NoLogoSelect = '无标识附加费',
  CoverLogo = '覆盖',
  PaperBox = '纸箱耗材',
  CourierBag = '快递袋耗材',
  OtherConsumables = '其他耗材',
  Destruction = '销毁',
  Delivery = '物流',
  SingleThingOneOrder = '一单一件订单',
  MultipleThingOneOrder = '一单多件订单',
  TotalPackages = '总件数',
}

export enum OperationStatus {
  NotFinished = '未完成',
  Finished = '已完成',
  Warning = '警告',
}

export type OperationRequirementModel = {
  operationType: OperationType;
  requireAmount: number | null;
  completeAmount: number;
  options?: string[]; //only for selectType
  value: string; //only for selectType
  operationStatus: OperationStatus;
  updateTimestamp: number;
  operationInputType: 'input' | 'select';
};

export const selectTypeORs = [OperationType.SelectBoxOnSku, OperationType.Delivery];

export const laterFilledInOperationRequirement = [
  OperationType.OpenBox,
  OperationType.OpenTray,
  OperationType.MakeBoxStrong,
  OperationType.CoverLogo,
  OperationType.PaperBox,
  OperationType.CourierBag,
  OperationType.OtherConsumables,
  OperationType.NoLogoSelect,
];

function getOperationRequirementModelByName(
  operationType: OperationType
): OperationRequirementModel {
  let options: string[] = [];
  if (operationType === OperationType.Delivery) {
    options = deliveryMethods;
  } else if (operationType === OperationType.SelectBoxOnSku) {
    options = selectBoxBases;
  }
  return {
    completeAmount: 0,
    operationStatus: OperationStatus.NotFinished,
    operationType: operationType,
    requireAmount: 0,
    value: '',
    options,
    updateTimestamp: 0,
    operationInputType: selectTypeORs.includes(operationType) ? 'select' : 'input',
  };
}

export function getORListByNames(operationTypes: OperationType[]) {
  return operationTypes.map(getOperationRequirementModelByName);
}
