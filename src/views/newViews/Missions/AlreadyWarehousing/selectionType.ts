import { InBoundDetailStatus, InBoundStatus } from '@/api/dataLayer/modules/notify/notify-api';

export const checkedObj = {
  type: 'selection',
  disabled: (row) =>
    row.inStatus !== InBoundDetailStatus.WaitCheck && row.inStatus !== InBoundStatus.WaitUnloading,
};

export const planObj = {
  type: 'selection',
  disabled: (row) => {
    if (row.inStatus === InBoundStatus.WaitOperate || row.inStatus === InBoundStatus.All) {
      if (row.outboundMethod === '标准托盘' && row.trayItems.length === 0) {
        return true;
      } else return row.outboundMethod === '大件托盘' && row.trayItems.length === 0;
    } else {
      return true;
    }
  },
};

export const offerObj = {
  type: 'selection',
  disabled: () => false,
};

export const inStorageObj = {
  type: 'selection',
  disabled: (row) => {
    return row.inStatus !== '库内操作';
  },
};
