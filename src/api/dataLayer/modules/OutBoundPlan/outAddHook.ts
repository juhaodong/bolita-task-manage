import { safeParseInt } from '@/store/utils/utils';
import { OutStatus } from '@/api/dataLayer/modules/notify/notify-api';
import { NotifyDetailManager } from '@/api/dataLayer/modules/notify/notify-detail';
import { truckDeliveryMethod } from '@/api/dataLayer/modules/deliveryMethod';
import { LogisticDetailManager } from '@/api/dataLayer/modules/logistic/logistic';

export async function afterPlanDetailAdded(planDetails, plan) {
  for (const detail of planDetails) {
    const instorageTrayNum = safeParseInt(detail.instorageTrayNum) - safeParseInt(detail.trayNum);
    const instorageContainerNum =
      safeParseInt(detail.instorageContainerNum) - safeParseInt(detail.containerNum);
    let status = OutStatus.Partial;
    if (instorageContainerNum == 0 && instorageTrayNum == 0) {
      status = OutStatus.All;
    }
    await NotifyDetailManager.editInternal(
      {
        instorageTrayNum,
        instorageContainerNum,
        outStatus: status,
      },
      detail.originId
    );
    if (truckDeliveryMethod.includes(plan.deliveryMethod)) {
      const outDetailId = detail.id;
      delete detail.id;
      console.log(detail);
      await LogisticDetailManager.addInternal({}, outDetailId);
    }
  }
}
