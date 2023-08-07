import { initModel } from '@/api/dataLayer/common/GeneralModel';
import { CashStatus, OutStatus } from '@/api/dataLayer/modules/notify/notify-api';
import { CarStatus } from '@/views/newViews/OutboundPlan/columns';
import { safeSumInt } from '@/store/utils/utils';
import { CheckStatus } from '@/views/newViews/OutboundDetail/columns';

export const outboundPath = 'outbound';
export const OutBoundPlanManager = initModel({
  init(value): any {
    value.trayNum = safeSumInt(value.planList, 'trayNum');
    value.containerNum = safeSumInt(value.planList, 'containerNum');
    value.outboundNum = value.trayNum + value.containerNum;
    value.outStatus = OutStatus.WaitForCheck;
    value.carStatus = CarStatus.UnAble;
    value.cashStatus = CashStatus.NotFinish;
    delete value.planList;
    console.log(value);
    return value;
  },
  async afterAddHook(id, _, planList) {
    for (const plan of planList) {
      console.log(plan, 'plan');
      await OutBoundDetailManager.addInternal(plan, id);
    }
  },
  collectionName: outboundPath,
});

export const outboundDetailPath = 'outboundDetail';
export const OutBoundDetailManager = initModel({
  init(value, outId: string): any {
    value.outId = outId;
    value.checkStatus = CheckStatus.Wait;
    value.ticketId = value.id;
    delete value.id;
    return value;
  },

  joinManager: {
    key: 'outId',
    loader: function () {
      return OutBoundPlanManager.load();
    },
  },
  collectionName: outboundDetailPath,
});
