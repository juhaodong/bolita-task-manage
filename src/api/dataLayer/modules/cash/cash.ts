import { initModel } from '@/api/dataLayer/common/GeneralModel';
import { CashStatus } from '@/api/dataLayer/modules/notify/notify-api';
import { CashCollectionStatus } from '@/views/newViews/ReconciliationManage/columns';

export interface CashModel {
  id: string;
  financeId?: string;
  containerNo: string;
  customerId: string;
  operationId: string;
  operationType: OperationType;
  amount: number;
  extraAmount: number;
  subtotal: number;
  note: string;
  cashStatus: CashStatus;
}

export enum OperationType {
  In = '入库',
  Out = '出库',
  Delivery = '物流',
  Refund = '索赔',
}

export const cashPath = 'cash';

export const CashManager = initModel({
  collectionName: cashPath,
  init(value: CashModel): any {
    value.cashStatus = CashStatus.WaitConfirm;
    return value;
  },
  idPrefix: 'J',
});

export interface CashDTO {
  containerNo?: string;
  operationId: string;
  customerId: string;
  operationType: OperationType;
  amount: any;
  note?: string;
  cashStatus?: CashStatus;
}

export async function addCash(cash: CashDTO) {
  return await CashManager.addInternal(cash);
}

export async function saveCash(cash: CashDTO, cashId?: string) {
  if (cashId) {
    await CashManager.editInternal(cash, cashId);
    return cashId;
  } else {
    return await addCash(cash);
  }
}

export const financePath = 'finance';

export const FinanceManager = initModel({
  collectionName: financePath,
  init(value: any): any {
    value.collectionStatus = CashCollectionStatus.NotCollect;
    return value;
  },
  idPrefix: 'F',
});

export const financeContainerPath = 'financeContainer';

export const FinanceContainerManager = initModel({
  collectionName: financeContainerPath,
  init(value: any): any {
    value.collectionStatus = CashCollectionStatus.NotCollect;
    return value;
  },
  idPrefix: 'FC',
});
