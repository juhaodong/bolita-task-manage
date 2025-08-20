import { getCollectionNextId, initModel } from '@/api/dataLayer/common/GeneralModel';
import { safeSumBy, safeSumInt } from '@/store/utils/utils';
import { where } from 'firebase/firestore';
import { OutBoundPlanManager } from '@/api/dataLayer/modules/OutBoundPlan/outBoundPlan';

function initCarpool(value, logisticDetailList) {
  value.trayNum = safeSumInt(logisticDetailList, 'trayNum');
  value.containerNum = safeSumInt(logisticDetailList, 'containerNum');
  value.totalPrice = safeSumBy(logisticDetailList, 'price');
  value.totalCost = value?.totalCost ?? 0;
  return value;
}

export const carpoolPath = 'carpool';
export const CarpoolManager = initModel({
  collectionName: carpoolPath,
  idPrefix: 'P',
  async init(value, outboundPlanList): Promise<any> {
    if (outboundPlanList.length > 1) {
      value.id = await getCollectionNextId(carpoolPath, 'CP');
    }
    return initCarpool(value, outboundPlanList);
  },
  async afterEditHook(id, value) {
    const updateValue = value;
    if (value.reservationGetProductTime) {
      updateValue.reservationOutboundDate = value.reservationGetProductTime;
    }
    await updatePickupInfo(updateValue, id);
  },
});

export async function carpoolSelfCheck(id: string) {
  if (id) {
    const carpool = await CarpoolManager.getById(id);
    const details = await OutBoundPlanManager.load(null, where('carpoolId', '==', id));
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
    ref?: string;
    PODFiles?: string[];
    pickupFiles?: string[];
  },
  id
) {
  const details = await OutBoundPlanManager.load(null, where('carpoolId', '==', id));
  const logisticUpdate = details.map((it) => ({
    ...params,
    id: it.id,
  }));

  await OutBoundPlanManager.massiveUpdate(logisticUpdate);

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
