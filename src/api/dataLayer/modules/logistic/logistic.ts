import { initModel } from '@/api/dataLayer/common/GeneralModel';
import { OutBoundDetailManager } from '@/api/dataLayer/modules/OutBoundPlan/outBoundPlan';
import { CashStatus } from '@/api/dataLayer/modules/notify/notify-api';

export const logisticPath = 'logistic';
export const LogisticDetailManager = initModel({
  collectionName: logisticPath,
  init(value): any {
    value.pickupDate = '';
    value.ISA = '';
    value.carPoolId = '';
    value.cashStatus = CashStatus.NotFinish;
    return value;
  },
  joinManager: {
    loader: OutBoundDetailManager.load,
    key: 'outboundDetailId',
  },
});
