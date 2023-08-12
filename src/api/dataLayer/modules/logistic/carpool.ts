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
  async afterEditHook(id, value) {
    const updateValue = value;
    console.log(value);
    if (value.reservationGetProductTime) {
      updateValue.reservationOutboundDate = value.reservationGetProductTime;
    }
    await updatePickupInfo(updateValue, id);
  },
});

export async function carpoolSelfCheck(id: string) {
  if (id) {
    const carpool = await CarpoolManager.getById(id);
    const details = await LogisticDetailManager.load(null, where('carpoolId', '==', id));
    if (details.length == 0) {
      await CarpoolManager.remove(id);
    } else {
      initCarpool(carpool, details);
    }
    await CarpoolManager.editInternal(carpool, id);
  }
}

export async function updatePickupInfo(
  params: {
    reservationOutboundDate?: string;
    deliveryCompany?: string;
    ISA?: string;
    REF?: string;
    PODFiles?: string[];
    pickupFiles?: string[];
  },
  id
) {
  const details = await LogisticDetailManager.load(null, where('carpoolId', '==', id));
  const logisticUpdate = details.map((it) => ({
    ...params,
    id: it.id,
  }));
  const outPlan = details.map((it) => ({
    ...params,
    id: it.outId,
  }));
  const outDetail = details.map((it) => ({
    ...params,
    id: it.outboundDetailId,
  }));
  await LogisticDetailManager.massiveUpdate(logisticUpdate);
  await OutBoundPlanManager.massiveUpdate(outPlan);
  await OutBoundDetailManager.massiveUpdate(outDetail);
  if (params.PODFiles || params.pickupFiles) {
    for (const d of details) {
      if (!d.outId) {
        continue;
      }
      const info = await OutBoundPlanManager.getById(d.outId);
      const value = {
        PODFiles: [...(info?.PODFiles ?? []), ...(params?.PODFiles ?? [])],
        pickupFiles: [...(info?.pickupFiles ?? []), ...(params?.pickupFiles ?? [])],
      };
      await OutBoundPlanManager.editInternal(value, d.outId);
    }
  }
}
