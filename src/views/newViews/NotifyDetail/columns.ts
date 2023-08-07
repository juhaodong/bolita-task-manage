import { DataTableColumns } from 'naive-ui';
import { joinDisplayColumn } from '@/views/bolita-views/composable/useableColumns';
import { FormField } from '@/views/bolita-views/composable/form-field-type';
import { generateOptionFromArray } from '@/utils/utils';
import { InBoundStatus, notifyType } from '@/views/newViews/NotifyList/api/notify-api';

export const columns: DataTableColumns<NotifyDetailInfoModel> = [
  {
    title: '入库ID',
    key: 'notifyId',
  },
  {
    title: '客户ID',
    key: 'customerId',
  },
  {
    title: '票号',
    key: 'ticketId',
  },
  {
    title: '箱号',
    key: 'containerId',
  },
  {
    title: '产品SKU',
    key: 'productSKU',
  },
  {
    title: '托数',
    key: 'trayNum',
  },
  {
    title: '箱数',
    key: 'containerNum',
  },
  joinDisplayColumn('containerStandards', '外箱规格', ['length', 'width', 'height'], '*'),
  {
    title: '重量kg',
    key: 'weightKg',
  },
  {
    title: '体积',
    key: 'volume',
  },
  {
    title: '入库状态',
    key: 'inStatus',
  },
  {
    title: '出库状态',
    key: 'outStatus',
  },
  {
    title: '运单号',
    key: 'waybillId',
  },
  {
    title: '目的国',
    key: 'targetCountry',
  },
  {
    title: 'FBACode',
    key: 'FBACode',
  },
  {
    title: 'FBA号',
    key: 'FBANo',
  },
  {
    title: 'PO',
    key: 'PO',
  },
  {
    title: '收件地址',
    key: 'shippingAddress',
  },
  {
    title: '物流方式',
    key: 'logisticsMethods',
  },
  {
    title: '库位',
    key: 'storeAddress',
  },
  {
    title: '存放天数',
    key: 'storageDays',
  },
  {
    title: '货物名称',
    key: 'productName',
  },
  {
    title: '包装',
    key: 'package',
  },
];

export type NotifyDetailInfoModel = {
  id: number;
  customerId: number;
  ticketId: number;
  containerId: number;
  productSKU: string;
  trayNum: number;
  containerNum: number;
  length: string;
  width: string;
  height: string;
  containerStandards: string;
  weightKg: string;
  volume: string;
  inboundStatus: string;
  outStatus: string;
  waybillId: number;
  targetCountry: string;
  FBACode: string;
  shippingAddress: string;
  logisticsMethods: string;
  storeAddress: string;
  storageDays: string;
  productName: string;
  package: string;
};

export const filters: FormField[] = [
  {
    label: '入库ID',
    field: 'notifyId',
  },
  {
    label: '票号',
    field: 'ticketId',
  },
  {
    label: '仓库',
    field: 'warehouseName',
  },
  {
    label: '入库状态',
    field: 'inStatus',
    component: 'NSelect',
    componentProps: {
      options: generateOptionFromArray(Object.values(InBoundStatus)),
    },
  },
  {
    label: '入库类型',
    field: 'notifyType',
    component: 'NSelect',
    componentProps: {
      options: generateOptionFromArray(notifyType),
    },
  },
  {
    label: 'FBACode',
    field: 'FBACode',
  },
  {
    label: '箱号',
    field: 'containerId',
  },
  {
    label: '产品SKU',
    field: 'productSKU',
  },
  {
    field: 'NotifyStartDateTime',
    component: 'NDatePicker',
    label: '入库开始时间',
    componentProps: {
      type: 'date',
      clearable: true,
    },
  },
  {
    field: 'NotifyEndDateTime',
    component: 'NDatePicker',
    label: '入库结束时间',
    componentProps: {
      type: 'date',
      clearable: true,
    },
  },
  {
    label: '物流方式',
    field: 'deliveryWay',
  },
];
