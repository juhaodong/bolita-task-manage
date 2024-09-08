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
      label: '尺寸',
      field: 'size',
    },
    {
      label: '总实重',
      field: 'weight',
    },
    {
      label: '总体积',
      field: 'volume',
    },
    {
      label: '客户备注',
      field: 'normalNote',
    },
  ]);
  builder.addAll([
    {
      label: 'FBA单号',
      field: 'FBADeliveryCode',
    },
    {
      label: 'PO',
      field: 'PO',
    },
    {
      label: 'FC/送货地址',
      field: 'FCAddress',
    },
    {
      label: '邮编',
      field: 'postcode',
    },
    {
      label: '出库方式',
      field: 'outboundMethod',
    },
    {
      label: '物流渠道',
      field: 'deliveryMethod',
    },
    {
      label: '操作要求',
      field: 'operationRequire',
    },
    {
      label: '操作备注',
      field: 'operationNote',
    },
    {
      label: '换单文件',
      field: 'changeOrderFiles',
    },
    {
      label: '库内操作',
      field: 'operateInStorage',
    },
    {
      label: '送货备注',
      field: 'transportationNote',
    },
  ]);
  builder.addAll([
    {
      label: '分拣标识',
      field: 'sign',
    },
    {
      label: '包装',
      field: 'packing',
    },
    {
      label: '托数',
      field: 'industrialTrayNum',
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
      label: '收件人',
      field: 'recipient',
    },
    {
      label: '电话',
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
      label: '工业品备注',
      field: 'industrialNote',
    },
  ]);
  return builder;
}

export function getNeededFieldByNotifyType(notifyType: NotifyType | null): any[] {
  const builder = getNeededFieldBuilder(notifyType);
  return builder.build();
}

export function getNeededColumnByFBACode() {
  return getFBACodeNeededFieldBuilder()
    .toColumn()
    .filter((it) => it?.meta != 'detail');
}

function getFBACodeNeededFieldBuilder() {
  const builder = formFieldBuilder();
  builder.addAll([
    {
      label: 'FBA CODE',
      field: 'code',
    },
    {
      label: '地址',
      field: 'address',
    },
    {
      label: 'City',
      field: 'city',
    },
    {
      label: 'State',
      field: 'state',
    },
    {
      label: 'Zip',
      field: 'postcode',
    },
  ]);
  return builder;
}

export function getNeededColumnByOutWarehouseCar() {
  return getOutCarFieldBuilder()
    .toColumn()
    .filter((it) => it?.meta != 'detail');
}

function getOutCarFieldBuilder() {
  const builder = formFieldBuilder();
  builder.addAll([
    {
      label: '日期',
      field: 'date',
    },
    {
      label: '渠道',
      field: 'channel',
    },
    {
      label: '约车类型',
      field: 'carType',
    },
    {
      label: '客户编号',
      field: 'customerId',
    },
    {
      label: '订单号',
      field: 'orderId',
    },
    {
      label: '托数(XP/FP)',
      field: 'trayNumber',
    },
    {
      label: '箱数Kartons',
      field: 'boxNumber',
    },
    {
      label: '可堆叠',
      field: 'stackable',
    },
    {
      label: '是否需要卸货设备',
      field: 'needEquipment',
    },
    {
      label: '提货地址',
      field: 'pickingAddress',
    },
    {
      label: '送货地址',
      field: 'sendingAddress',
    },
    {
      label: '取货日期+时点',
      field: 'pickingDate',
    },
    {
      label: '送货日期+时点',
      field: 'sendingDate',
    },
    {
      label: '物流平台订单号',
      field: 'platformOrderId',
    },
    {
      label: '运营对外报价',
      field: 'offerPrice',
    },
    {
      label: 'POD',
      field: 'POD',
    },
    {
      label: 'cbm/尺寸/重量',
      field: 'size',
    },
    {
      label: '需求',
      field: 'demand',
    },
    {
      label: '询价需求',
      field: 'priceDemand',
    },
    {
      label: '是否有送仓文件',
      field: 'warehouseDeliveryFile',
    },
    {
      label: '物流公司',
      field: 'logisticsCompany',
    },
    {
      label: '成本底价',
      field: 'costPrice',
    },
    {
      label: '物流建议报价',
      field: 'logisticsPrice',
    },
    {
      label: '备注',
      field: 'note',
    },
  ]);
  return builder;
}
