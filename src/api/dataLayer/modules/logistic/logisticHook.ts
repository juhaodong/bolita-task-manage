import { truckDeliveryMethod } from '@/api/dataLayer/modules/deliveryMethod';

import { LogisticDetailManager } from '@/api/dataLayer/modules/OutBoundPlan/outBoundPlan';

export async function addLogisticAfterPlan(value, id) {
  if (truckDeliveryMethod.includes(value.deliveryMethod)) {
    await LogisticDetailManager.addInternal(value, id);
  }
}
