import { NotifyType } from '@/api/dataLayer/modules/notify/notify-api';
import { formFieldBuilder } from '@/api/dataLayer/fieldDefination/form-field-sort-label';

export function getNeededColumnByNotifyType(notifyType: NotifyType | null) {
  return getNeededFieldBuilder(notifyType)
    .toColumn()
    .filter((it) => it?.meta != 'detail');
}

function getNeededFieldBuilder(notifyType: NotifyType | null) {
  const builder = formFieldBuilder();
  builder.add({
    label: '票号',
    field: 'id',
  });
  builder.add({
    label: '箱号',
    field: 'containerId',
  });
  if (notifyType == NotifyType.TrayOrBox) {
  }
  builder.addAll([
    {
      label: '产品SKU',
      field: 'productSKU',
    },
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
        field: 'FBACode',
      },
      {
        label: 'PO',
        field: 'po',
      },
      {
        label: 'FBA号',
        field: 'FBANo',
      },
      {
        label: '收件人',
        field: 'name',
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
    builder.add({
      label: '物流方式',
      field: 'logisticsMethods',
    });
    builder.add({
      label: '包装',
      field: 'package',
    });
    builder.add({
      label: '装柜位置',
      field: 'storeAddress',
    });
  } else {
    builder.add({
      label: '发货日期',
      field: 'deliveryDate',
    });
  }
  builder.add({
    label: '备注',
    field: 'note',
  });
  builder.add({
    label: '产品名称',
    field: 'productName',
  });
  return builder;
}

export function getNeededFieldByNotifyType(notifyType: NotifyType | null): any[] {
  const builder = getNeededFieldBuilder(notifyType);
  return builder.build();
}
