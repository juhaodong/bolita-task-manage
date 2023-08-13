import { initModel } from '@/api/dataLayer/common/GeneralModel';
import { CashStatus, OutStatus } from '@/api/dataLayer/modules/notify/notify-api';
import { CarStatus } from '@/views/newViews/OutboundPlan/columns';
import { safeSumInt } from '@/store/utils/utils';
import { CheckStatus } from '@/views/newViews/OutboundDetail/columns';
import { formatItemAddress } from '@/api/dataLayer/fieldDefination/addressGroup';
import { where } from 'firebase/firestore';
import { uniq } from 'lodash-es';

export const outboundPath = 'outbound';
export const OutBoundPlanManager = initModel({
  init(value): any {
    value.trayNum = safeSumInt(value.planList, 'outBoundTrayNum');
    value.containerNum = safeSumInt(value.planList, 'outBoundContainerNum');
    value.outboundNum = value.trayNum + value.containerNum;
    value.outStatus = OutStatus.WaitForCheck;
    value.carStatus = CarStatus.UnAble;
    value.cashStatus = CashStatus.NotFinish;
    delete value.planList;
    return value;
  },
  async afterAddHook(id, value, planList) {
    const ids = await OutBoundDetailManager.massiveAdd(planList, id, value);
    planList.map((plan, index) => {
      plan.id = ids[index];
    });
  },
  collectionName: outboundPath,
});

export const outboundDetailPath = 'outboundDetail';
export const OutBoundDetailManager = initModel({
  init(value, outId: string, plan): any {
    value.outId = outId;
    value.checkStatus = CheckStatus.Wait;
    value.trayNum = value.outBoundTrayNum;
    value.containerNum = value.outBoundContainerNum;
    value.deliveryMethod = plan.deliveryMethod;
    value.fbaCode = plan.fbaCode;
    value.deliveryAddress = plan.deliveryAddress;
    value.targetCountry = plan.targetCountry;
    value.postCode = plan.postCode;
    value.contact = plan.contact;
    value.email = plan.email;
    value.street = plan.street;
    value.houseNo = plan.houseNo;
    value.appendAddress = plan.appendAddress;
    value.city = plan.city;
    value.state = plan.state;
    value.country = plan.country;
    formatItemAddress(value);
    delete value.outBoundTrayNum;
    delete value.outBoundContainerNum;
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
        await OutBoundPlanManager.editInternal({ outStatus: OutStatus.Wait }, outId);
      }
    }
  },
});
