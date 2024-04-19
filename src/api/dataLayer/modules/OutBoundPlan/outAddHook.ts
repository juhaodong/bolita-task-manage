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
import { useUserStore } from '@/store/modules/user';
import { CarStatus } from '@/views/newViews/OutboundPlan/columns';

export async function afterPlanDetailAdded(planDetails) {
  const notifyIds: any = {};
  const userInfo = useUserStore().info;
  const updateValue = planDetails.map((detail) => {
    notifyIds[detail?.notifyId] = detail?.notifyId;
    const timeLineInfo = detail.timeLine;
    timeLineInfo.unshift({
      operator: userInfo?.realName,
      detailTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      note: '提交了出库计划',
    });
    return {
      needOfferPrice: detail.needOfferPrice,
      createPlanTime: dayjs().format('YYYY-MM-DD'),
      inStatus:
        detail.carStatus === CarStatus.NoNeed ? CarStatus.NoNeed : OutPlanStatus.AlreadyPlan,
      id: detail.originId,
      outboundId: detail.outboundId,
      timeLine: timeLineInfo,
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
