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
    label: '票号',
    field: 'ticketId',
  });
  builder.add({
    label: '箱号',
    field: 'containerId',
  });
  builder.addAll([
    {
      label: '托数',
      field: 'trayNum',
    },
    {
      label: '箱数',
      field: 'containerNum',
    },
    {
      label: '长',
      field: 'length',
    },
    {
      label: '宽',
      field: 'width',
    },
    {
      label: '高',
      field: 'height',
    },
    {
      label: '重量kg',
      field: 'weightKg',
    },
  ]);
  if (notifyType == NotifyType.Container) {
    builder.add({
      label: '体积',
      field: 'volume',
    });
  }
  builder.add({
    label: '运单号',
    field: 'waybillId',
  });
  if (notifyType == NotifyType.Container) {
    builder.addAll([
      {
        label: '目的国',
        field: 'targetCountry',
      },
      {
        label: 'FBAcode',
        field: 'fbaCode',
      },
      {
        label: 'PO',
        field: 'PO',
      },
      {
        label: 'FBA号',
        field: 'FBANo',
      },
      {
        label: '收件人',
        field: 'contact',
      },
      {
        label: '电话/邮箱',
        field: 'email',
      },
      {
        label: '街道',
        field: 'street',
      },
      {
        label: '门牌号',
        field: 'houseNo',
      },
      {
        label: '地址附加',
        field: 'address2',
      },
      {
        label: '邮编',
        field: 'postCode',
      },
      {
        label: '城市',
        field: 'city',
      },
      {
        label: '州',
        field: 'state',
      },
    ]);
    builder.addAll([
      {
        label: '物流方式',
        field: 'deliveryMethod',
      },
      {
        label: '详细物流方式',
        field: 'deliveryDetail',
      },
    ]);
    builder.add({
      label: '包装',
      field: 'package',
    });
  } else {
    builder.addAll([
      {
        label: '物流方式',
        field: 'deliveryMethod',
      },
      {
        label: '详细物流方式',
        field: 'deliveryDetail',
      },
    ]);
  }
  builder.add({
    label: '备注',
    field: 'note',
  });
  builder.add({
    label: '货物名称',
    field: 'productName',
  });
  return builder;
}

export function getNeededFieldByNotifyType(notifyType: NotifyType | null): any[] {
  const builder = getNeededFieldBuilder(notifyType);
  return builder.build();
}
