import { NotifyType } from '@/api/dataLayer/modules/notify/notify-api';
import { formFieldBuilder } from '@/api/dataLayer/fieldDefination/common';

export function getNeededColumnByNotifyType(notifyType: NotifyType | null) {
  return getNeededFieldBuilder(notifyType)
    .toColumn()
    .filter((it) => it?.meta != 'detail');
}

function getNeededFieldBuilder(notifyType: NotifyType | null) {
  const builder = formFieldBuilder();
  builder.addAll([
    {
      label: '柜号',
      field: 'containerId',
    },
    {
      label: '票号',
      field: 'ticketId',
    },
    {
      label: '国家',
      field: 'country',
    },
    {
      label: '托数',
      field: 'trayNum',
    },
    {
      label: '件数',
      field: 'number',
    },
    {
      label: '总实重',
      field: 'weight',
    },
    {
      label: '总体积',
      field: 'volume',
    },
  ]);
  builder.addAll([
    {
      label: 'FBA/快递单号',
      field: 'FBA/DeliveryCode',
    },
    {
      label: 'PO',
      field: 'PO',
    },
    {
      label: 'FC/送货地址',
      field: 'FC/Address',
    },
    {
      label: '操作',
      field: 'operation',
    },
    {
      label: '换单文件',
      field: 'changeOrderFiles',
    },
  ]);
  builder.addAll([
    {
      label: '分拣标识',
      field: 'sign',
    },
    {
      label: '包装',
      field: 'package',
    },
    {
      label: '品名',
      field: 'productName',
    },
    {
      label: 'UN号',
      field: 'UNNumber',
    },
    {
      label: '邮编',
      field: 'postcode',
    },
    {
      label: '街道+门牌号',
      field: 'address1',
    },
    {
      label: '地址2',
      field: 'address2',
    },
    {
      label: '公司名称',
      field: 'companyName',
    },
    {
      label: '收件人',
      field: 'recipient',
    },
    {
      label: '联系电话',
      field: 'phone',
    },
    {
      label: '邮箱',
      field: 'email',
    },
    {
      label: '是否需要预约',
      field: 'needReserve',
    },
    {
      label: '备注',
      field: 'note',
    },
  ]);
  return builder;
}

export function getNeededFieldByNotifyType(notifyType: NotifyType | null): any[] {
  const builder = getNeededFieldBuilder(notifyType);
  return builder.build();
}
