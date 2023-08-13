import { safeParseInt } from '@/store/utils/utils';
import { OutStatus } from '@/api/dataLayer/modules/notify/notify-api';
import { truckDeliveryMethod } from '@/api/dataLayer/modules/deliveryMethod';
import { LogisticDetailManager } from '@/api/dataLayer/modules/logistic/logistic';
import { NotifyDetailManager } from '@/api/dataLayer/modules/notify/notify-detail';
import { groupBy } from 'lodash-es';

export async function afterPlanDetailAdded(planDetails, plan) {
  const updateValue = planDetails.map((detail) => {
    const instorageTrayNum = safeParseInt(detail.instorageTrayNum) - safeParseInt(detail.trayNum);
    const instorageContainerNum =
      safeParseInt(detail.instorageContainerNum) - safeParseInt(detail.containerNum);
    let status = OutStatus.Partial;
    if (instorageContainerNum == 0 && instorageTrayNum == 0) {
      status = OutStatus.All;
    }

    return {
      instorageTrayNum,
      instorageContainerNum,
      outStatus: status,
      id: detail.id.toString(),
    };
  });
  await NotifyDetailManager.massiveUpdate(updateValue);
  if (truckDeliveryMethod.includes(plan.deliveryMethod)) {
    const groupedInfo = groupBy(planDetails, 'deliveryAddress');
    console.log(groupedInfo);
    await LogisticDetailManager.massiveAdd(
      planDetails.map((it) => ({
        outboundDetailId: it.id,
      }))
    );
  }
}
