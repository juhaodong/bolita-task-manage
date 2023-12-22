import { NotifyType } from '@/api/dataLayer/modules/notify/notify-api';
import { formFieldBuilder } from '@/api/dataLayer/fieldDefination/common';

export function getNeededColumnByNotifyType(notifyType: NotifyType | null) {
  return getNeededFieldBuilder(notifyType)
    .toColumn()
    .filter((it) => it?.meta != 'detail');
}

function getNeededFieldBuilder(notifyType: NotifyType | null) {
  const builder = formFieldBuilder();
  builder.add({
    label: '自然周',
    field: 'weeks',
  });
  builder.add({
    label: '预计到仓时间',
    field: 'planArriveDateTime',
  });
  builder.add({
    label: '地址',
    field: 'address',
  });
  builder.add({
    label: '实际仓位日期',
    field: 'realArriveDateTime',
  });
  builder.add({
    label: '仓位时间',
    field: 'inHouseTime',
  });
  builder.add({
    label: '托盘',
    field: 'trayNum',
  });
  builder.add({
    label: '卡车号',
    field: 'carNumber',
  });
  builder.add({
    label: 'ISA',
    field: 'ISA',
  });
  builder.add({
    label: '目的地',
    field: 'destination',
  });
  builder.add({
    label: '可约车',
    field: 'bookingCar',
  });
  builder.add({
    label: '提货时间',
    field: 'pickUpDateTime',
  });
  builder.add({
    label: '提货方',
    field: 'pickUpPerson',
  });
  builder.add({
    field: 'POD',
    label: 'POD',
  });
  builder.add({
    label: '备注',
    field: 'note',
  });
  builder.add({
    label: '备注',
    field: 'note',
  });
  return builder;
}

export function getNeededFieldByNotifyType(notifyType: NotifyType | null): any[] {
  const builder = getNeededFieldBuilder(notifyType);
  return builder.build();
}
