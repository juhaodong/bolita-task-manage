import { initModel } from '@/api/dataLayer/common/GeneralModel';
import { CashStatus, OutStatus } from '@/api/dataLayer/modules/notify/notify-api';
import { CarStatus } from '@/views/newViews/OutboundPlan/columns';
import { safeSumInt } from '@/store/utils/utils';

export const outboundPath = 'outbound';
export const OutBoundPlanManager = initModel({
  init(value): any {
    console.log(value.planList);
    value.trayNum = safeSumInt(value.planList, 'trayNum');
    value.containerNum = safeSumInt(value.planList, 'containerNum');
    value.outboundNum = value.trayNum + value.containerNum;
    value.outStatus = OutStatus.WaitForCheck;
    value.carStatus = CarStatus.UnAble;
    value.cashStatus = CashStatus.NotFinish;
    return value;
  },
  collectionName: outboundPath,
});
