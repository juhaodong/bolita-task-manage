export enum SelectBoxBase {
  SKU = 'FNSKU挑箱',
  Mai = '箱唛挑箱',
}

export enum ChangeOrderType {
  Scan = '扫码',
  Manual = '人工',
}

export enum YesOrNo {
  Yes = '是',
  No = '否',
}

export const selectBoxBases = Object.values(SelectBoxBase);
export const changeOrderTypes = Object.values(ChangeOrderType);
export const yesOrNo = Object.values(YesOrNo);

export enum OperationType {
  Amount = '数量',
  Unload = '卸柜',
  Sort = '分拣',
  Load = '装柜（装车）',
  TrayStorage = '托盘入库',
  BoxStorage = '包裹入库',
  OnShelf = '上架',
  Check = '清点',
  SelectBoxOnSku = '挑箱出库',
  FastOutBound = '快转出库',
  TrayOutBound = '托盘出库',
  ShouldChangeTray = '是否更换托盘',
  SelfOutbound = '自提出库',
  BoxLabel = '大标签（含A4纸）',
  SkuLabel = '小标签',
  MakeTray = '打托',
  ChangeOrder = '换单',
  Other = '其他',
  OneUseTray = '一次性托盘',
  EuropeStandardTray = '欧标托盘',
  PaperBox = '纸箱耗材',
  CourierBag = '快递袋耗材',
  OtherConsumables = '其他耗材',
  TakePic = '拍照',
  MakeBoxStrong = '箱体加固',
  NoLogoSelect = '无标识附加费',
  CoverLogo = '覆盖',
  Destruction = '销毁',
  OrderCancel = '取消订单',
  OtherSpecial = '其他',
  SingleThingOneOrder = '一单一件订单',
  MultipleThingOneOrder = '一单多件订单',
  TotalPackages = '总件数',
}

export type OperationRequirementModel = {
  operationType: OperationType;
  requireAmount: number | null;
  completeAmount: number;
  options?: string[]; //only for selectType
  value: string; //only for selectType
  updateTimestamp: number;
  operationInputType: 'input' | 'select';
};

export const laterFilledInOperationRequirement = [
  OperationType.ShouldChangeTray,
  OperationType.OrderCancel,
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
  if (operationType === OperationType.SelectBoxOnSku) {
    options = selectBoxBases;
  } else if (operationType === OperationType.ShouldChangeTray) {
    options = yesOrNo;
  } else if (operationType === OperationType.ChangeOrder) {
    options = changeOrderTypes;
  }
  return {
    completeAmount: 0,
    operationType: operationType,
    requireAmount: 0,
    value: '',
    options,
    updateTimestamp: 0,
    operationInputType: options.length > 0 ? 'select' : 'input',
  };
}

export function getORListByNames(operationTypes: OperationType[]) {
  return operationTypes.map(getOperationRequirementModelByName);
}
