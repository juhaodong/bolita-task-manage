import {
  InBoundStatus,
  NotifyManager,
  OutPlanStatus,
  OutStatus,
} from '@/api/dataLayer/modules/notify/notify-api';
import {
  getNotifyDetailListByNotify,
  NotifyDetailManager,
} from '@/api/dataLayer/modules/notify/notify-detail';
import dayjs from 'dayjs';

export async function afterPlanDetailAdded(planDetails) {
  const notifyIds: any = {};
  console.log(planDetails, 'details');
  const updateValue = planDetails.map((detail) => {
    // const instorageTrayNum = safeParseInt(detail.instorageTrayNum) - safeParseInt(detail.trayNum);
    // const instorageContainerNum =
    //   safeParseInt(detail.instorageContainerNum) - safeParseInt(detail.containerNum);
    // if (instorageContainerNum == 0) {
    //   status = OutStatus.WaitOperation;
    // }
    notifyIds[detail?.notifyId] = detail?.notifyId;
    return {
      // instorageTrayNum,
      // instorageContainerNum,
      createPlanTime: dayjs().format('YYYY-MM-DD'),
      inStatus: OutPlanStatus.AlreadyPlan,
      id: detail.originId,
    };
  });
  console.log(updateValue, 'value');
  await NotifyDetailManager.massiveUpdate(updateValue);
  for (const id of Object.values(notifyIds)) {
    const details = await getNotifyDetailListByNotify(id);
    const res = details.filter((it) => it.inStatus !== InBoundStatus.All);
    if (res.length > 0) {
      await NotifyManager.editInternal({ inStatus: OutStatus.Partial }, id);
    }
    // const totalArriveNum =
    //   safeSumInt(details, 'arrivedTrayNum') + safeSumInt(details, 'arrivedContainerNum');
    // const totalInstorageNum =
    //   safeSumInt(details, 'instorageContainerNum') + safeSumInt(details, 'instorageTrayNum');
    // let newOutStatus = OutStatus.Wait;
    // if (totalInstorageNum == 0) {
    //   newOutStatus = OutStatus.All;
    // } else if (totalArriveNum > totalInstorageNum) {
    //   newOutStatus = OutStatus.PartialOut;
    // }
    // await NotifyManager.editInternal({ outStatus: newOutStatus }, id);
  }
}
