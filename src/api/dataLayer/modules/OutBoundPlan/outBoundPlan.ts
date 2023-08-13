import { initModel } from '@/api/dataLayer/common/GeneralModel';
import { CashStatus, OutStatus } from '@/api/dataLayer/modules/notify/notify-api';
import { CarStatus } from '@/views/newViews/OutboundPlan/columns';
import { safeSumInt } from '@/store/utils/utils';
import { OutBoundDetailManager } from '@/api/dataLayer/modules/OutBoundPlan/outboundDetail';
import { addLogisticAfterPlan } from '@/api/dataLayer/modules/logistic/logisticHook';

export const outboundPath = 'outbound';
export const OutBoundPlanManager = initModel({
  init(value): any {
    value.trayNum = safeSumInt(value.planList, 'outBoundTrayNum');
    value.containerNum = safeSumInt(value.planList, 'outBoundContainerNum');
    value.outboundNum = value.trayNum + value.containerNum;
    value.outStatus = OutStatus.WaitForCheck;
    value.carStatus = CarStatus.UnAble;
    value.cashStatus = CashStatus.NotFinish;
    delete value.planList;
    return value;
  },
  async afterAddHook(id, value, planList) {
    const ids = await OutBoundDetailManager.massiveAdd(planList, id, value);
    planList.map((plan, index) => {
      plan.id = ids[index];
    });
    await addLogisticAfterPlan(value, id);
  },
  collectionName: outboundPath,
});
export const logisticPath = 'logistic';
export const LogisticDetailManager = initModel({
  collectionName: logisticPath,
  init(value, outId): any {
    value.pickupDate = '';
    value.ISA = '';
    value.carPoolId = '';
    value.cashStatus = CashStatus.NotFinish;
    value.outId = outId;
    return value;
  },
  joinManager: {
    loader: OutBoundPlanManager.load,
    key: 'outId',
  },
});
