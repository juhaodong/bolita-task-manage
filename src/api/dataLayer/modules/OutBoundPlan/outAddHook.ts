import { InBoundStatus, OutPlanStatus, OutStatus } from '@/api/dataLayer/modules/notify/notify-api';
import dayjs from 'dayjs';
import { useUserStore } from '@/store/modules/user';
import { CarStatus } from '@/views/newViews/OutboundPlan/columns';
import { addOrUpdateTaskTimeLine } from '@/api/newDataLayer/TimeLine/TimeLine';
import { addOrUpdateTask, getTaskListByNotifyId } from '@/api/newDataLayer/TaskList/TaskList';
import { addOrUpdateNotify, getNotifyById } from '@/api/newDataLayer/Notify/Notify';

export async function afterPlanDetailAdded(planDetails) {
  const notifyIds = [];
  const userInfo = useUserStore().info;
  const quest = planDetails.map(async (detail) => {
    notifyIds.push(detail?.notifyId);
    detail.inStatus =
      detail.carStatus === CarStatus.NoNeed ? CarStatus.NoNeed : OutPlanStatus.AlreadyPlan;
    await addOrUpdateTask(detail);
    await addOrUpdateTaskTimeLine({
      useType: 'normal',
      bolitaTaskId: detail.id,
      operator: userInfo?.realName,
      detailTime: dayjs().valueOf(),
      note: '提交了出库计划',
    });
  });
  await Promise.all(quest);
  for (const id of Object.values(notifyIds)) {
    const details = await getTaskListByNotifyId(id);
    const notifyDetail = await getNotifyById(id);
    const res = details.filter((it) => it.inStatus !== InBoundStatus.All);
    notifyDetail.inventoryId = notifyDetail.inventory.id;
    notifyDetail.customerId = notifyDetail.customer.id;
    if (res.length > 0) {
      notifyDetail.inStatus = OutStatus.Partial;
      await addOrUpdateNotify(notifyDetail);
    }
  }
}
