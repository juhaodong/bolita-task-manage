import { initModel } from '@/api/dataLayer/common/GeneralModel';
import { OutBoundDetailManager } from '@/api/dataLayer/modules/OutBoundPlan/outBoundPlan';

export const LogisticDetailManager = initModel({
  collectionName: 'logistic',
  init(value): any {
    value.pickupDate = '';
    value.ISA = '';
    value.carPoolId = '';
    return value;
  },
  joinManager: {
    loader: OutBoundDetailManager.load,
    key: 'outboundDetailId',
  },
});
