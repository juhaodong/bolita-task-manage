import { initModel } from '@/api/dataLayer/common/GeneralModel';
import { CashStatus } from '@/api/dataLayer/modules/notify/notify-api';

export const logisticServicePath = 'logisticService';
export const LogisticServiceManager = initModel({
  collectionName: logisticServicePath,
  init(value): any {
    value.handleStatus = HandleStatus.Doing;
    value.cashStatus = CashStatus.NotFinish;
    return value;
  },
});
export enum HandleStatus {
  Finished = '完结',
  Doing = '处理中',
}

export const handleStatus = Object.values(HandleStatus);
