import { initModel } from '@/api/dataLayer/common/GeneralModel';
import { CheckStatus } from '@/views/newViews/OutboundDetail/columns';
import { where } from 'firebase/firestore';
import { uniq } from 'lodash-es';
import { OutStatus } from '@/api/dataLayer/modules/notify/notify-api';
import { OutBoundPlanManager } from '@/api/dataLayer/modules/OutBoundPlan/outBoundPlan';
import { truckDeliveryMethod } from '@/api/dataLayer/modules/deliveryMethod';

export const outboundDetailPath = 'outboundDetail';
export const OutBoundDetailManager = initModel({
  init(value, outId: string): any {
    value.outId = outId;
    value.checkStatus = CheckStatus.Wait;
    value.notifyDetailId = value.id;
    delete value.outStatus;
    // formatItemAddress(value);
    delete value.id;
    return value;
  },
  joinManager: {
    key: 'outId',
    loader: function () {
      return OutBoundPlanManager.load();
    },
  },
  collectionName: outboundDetailPath,
  async afterEditHook(id, value) {
    if (value.checkStatus) {
      const currentInfo = await OutBoundDetailManager.getById(id);
      const outId = currentInfo.outId;
      const list = await OutBoundDetailManager.load(null, where('outId', '==', outId));
      const status = uniq(list.map((it) => it.checkStatus));
      if (status.length == 1 && status[0] == CheckStatus.Checked) {
        const outInfo = await OutBoundPlanManager.getById(outId);
        let newOutStatus = OutStatus.WaitOperation;
        if (truckDeliveryMethod.includes(outInfo.deliveryMethod)) {
          newOutStatus = OutStatus.WaitForPriceConfirm;
        }
        await OutBoundPlanManager.editInternal({ outStatus: newOutStatus }, outId);
      }
    }
  },
});
