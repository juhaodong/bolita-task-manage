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
  const updateValue = planDetails.map((detail) => {
    notifyIds[detail?.notifyId] = detail?.notifyId;
    return {
      createPlanTime: dayjs().format('YYYY-MM-DD'),
      inStatus: OutPlanStatus.AlreadyPlan,
      id: detail.originId,
    };
  });
  await NotifyDetailManager.massiveUpdate(updateValue);
  for (const id of Object.values(notifyIds)) {
    const details = await getNotifyDetailListByNotify(id);
    const res = details.filter((it) => it.inStatus !== InBoundStatus.All);
    if (res.length > 0) {
      await NotifyManager.editInternal({ inStatus: OutStatus.Partial }, id);
    }
  }
}
