import { initModel } from '@/api/dataLayer/common/GeneralModel';
import { CashStatus, OutStatus } from '@/api/dataLayer/modules/notify/notify-api';
import { CarStatus } from '@/views/newViews/OutboundPlan/columns';
import { safeSumInt } from '@/store/utils/utils';
import { OutBoundDetailManager } from '@/api/dataLayer/modules/OutBoundPlan/outboundDetail';
import { truckDeliveryMethod } from '@/api/dataLayer/modules/deliveryMethod';

export const outboundPath = 'outbound';
export const OutBoundPlanManager = initModel({
  init(value): any {
    value.trayNum = safeSumInt(value.planList, 'outBoundTrayNum');
    value.containerNum = safeSumInt(value.planList, 'outBoundContainerNum');
    const isTruck = truckDeliveryMethod.includes(value.deliveryMethod);
    value.outboundNum = value.trayNum + value.containerNum;
    value.outStatus = OutStatus.WaitForCheck;
    value.carStatus = isTruck ? CarStatus.UnAble : CarStatus.NoNeed;
    value.cashStatus = CashStatus.NotFinish;
    value.ISA = '';
    value.carPoolId = '';
    value.logisticCashStatus = CashStatus.NotFinish;
    delete value.planList;
    return value;
  },
  async afterAddHook(id, value, planList) {
    const ids = await OutBoundDetailManager.massiveAdd(planList, id, value);
    planList.map((plan, index) => {
      plan.id = ids[index];
    });
  },
  async afterEditHook(id, value) {
    if (value.CMR && value?.outStatus != OutStatus.All) {
      await OutBoundPlanManager.editInternal({ outStatus: OutStatus.All }, id);
    }
  },
  collectionName: outboundPath,
});
