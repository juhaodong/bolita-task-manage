import { initModel } from '@/api/dataLayer/common/GeneralModel';
import { CashStatus } from '@/api/dataLayer/modules/notify/notify-api';

export const cashPath = 'cash';

export interface CashModel {
  id: string;
  financeId?: string;
  containerNo: string;
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
export const CashManager = initModel({
  collectionName: cashPath,
  init(value: CashModel): any {
    value.cashStatus = CashStatus.WaitConfirm;
    value.extraAmount = 0;
    value.subtotal = value.amount;
    return value;
  },
  idPrefix: 'J',
});

export interface CashDTO {
  containerNo?: string;
  operationId: string;
  operationType: OperationType;
  amount: string;
  note?: string;
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
