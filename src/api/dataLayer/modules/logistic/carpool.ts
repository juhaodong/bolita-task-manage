import { initModel } from '@/api/dataLayer/common/GeneralModel';
import { safeSumBy, safeSumInt } from '@/store/utils/utils';
import { CashStatus } from '@/api/dataLayer/modules/notify/notify-api';
import { LogisticDetailManager } from '@/api/dataLayer/modules/logistic/logistic';
import { where } from 'firebase/firestore';
import {
  OutBoundDetailManager,
  OutBoundPlanManager,
} from '@/api/dataLayer/modules/OutBoundPlan/outBoundPlan';

function initCarpool(value, logisticDetailList) {
  value.trayNum = safeSumInt(logisticDetailList, 'trayNum');
  value.containerNum = safeSumInt(logisticDetailList, 'containerNum');
  value.totalPrice = safeSumBy(logisticDetailList, 'price');
  value.cashStatus = CashStatus.NotFinish;
  value.totalCost = value?.totalCost ?? 0;
  return value;
}

export const carpoolPath = 'carpool';
export const CarpoolManager = initModel({
  collectionName: carpoolPath,
  idPrefix: 'P',
  init(value, logisticDetailList): any {
    return initCarpool(value, logisticDetailList);
  },
});

export async function carpoolSelfCheck(id: string) {
  if (id) {
    const carpool = await CarpoolManager.getById(id);
    const details = await LogisticDetailManager.load(null, where('carpoolId', '==', id));
    if (details.length == 0) {
      carpool.createTimestamp = '';
    } else {
      initCarpool(carpool, details);
    }
    await CarpoolManager.editInternal(carpool, id);
  }
}

export async function updatePickupTime(newTime: number, id) {
  const details = await LogisticDetailManager.load(null, where('carpoolId', '==', id));
  for (const detail of details) {
    await LogisticDetailManager.editInternal(
      {
        reservationOutboundDate: newTime,
      },
      detail.id
    );
    await OutBoundPlanManager.editInternal(
      {
        reservationOutboundDate: newTime,
      },
      detail.outId
    );
    await OutBoundDetailManager.editInternal(
      {
        reservationOutboundDate: newTime,
      },
      detail.outboundDetailId
    );
  }
}
