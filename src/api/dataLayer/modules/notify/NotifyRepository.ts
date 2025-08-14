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
      label: '件数',
      field: 'number',
    },
    {
      label: '托数',
      field: 'trayNum',
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
      label: '尺寸',
      field: 'size',
    },
    {
      label: '包装',
      field: 'packing',
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
      label: 'FC',
      field: 'FCAddress',
    },
    {
      label: '送货地址',
      field: 'address',
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
      label: '尾板',
      field: 'tailgate',
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
    { label: '日期', field: 'orderDate' },
    { label: '渠道', field: 'channelType' },
    { label: '约车类型', field: 'vehicleType' },
    { label: '客户编号', field: 'customer' },
    { label: '订单号', field: 'orderNumber' },
    { label: '托数(XP/FP)', field: 'trayCount' },
    { label: '箱数Kartons', field: 'boxCount' },
    { label: '可堆叠', field: 'stackable' },
    { label: '是否需要卸货设备', field: 'unloadingEquipmentRequired' },
    { label: '提货地址', field: 'pickupAddress' },
    { label: '送货地址', field: 'deliveryAddress' },
    { label: '送货日期+时点', field: 'pickupDate' },
    { label: '取货日期+时点', field: 'deliveryDate' },
    { label: '物流平台订单号', field: 'logisticsOrderNumber' },
    { label: '运营对外报价', field: 'publicQuotation' },
    { label: 'cbm/尺寸/重量', field: 'dimensions' },
    { label: '需求', field: 'requirements' },
    { label: '询价需求', field: 'inquiryRequirements' },
    { label: '是否有送仓文件', field: 'hasWarehouseDocuments' },
    { label: '物流公司', field: 'logisticsCompany' },
    { label: '成本底价', field: 'baseCost' },
    { label: '物流建议报价', field: 'suggestedQuotation' },
    { label: '备注', field: 'note' },
    { label: '文件', field: 'files' },
  ]);
  return builder;
}
