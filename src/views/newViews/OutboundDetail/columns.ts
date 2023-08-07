import { DataTableColumns } from 'naive-ui';
import { timeColumn } from '@/views/bolita-views/composable/useableColumns';
import { FormField } from '@/views/bolita-views/composable/form-field-type';

export const columns: DataTableColumns<OutboundDetailModel> = [
  {
    title: '明细ID',
    key: 'id',
  },
  {
    title: '出库ID',
    key: 'outId',
  },
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
    title: '托',
    key: 'trayNum',
  },
  {
    title: '数量(箱/件)',
    key: 'containerNum',
  },
  {
    title: '规格',
    key: 'containerStandards',
  },
  {
    title: '重量kg',
    key: 'weightKg',
  },
  {
    title: '体积',
    key: 'volume',
  },
  {
    title: '仓库',
    key: 'wareHouse',
  },
  {
    title: '审核状态',
    key: 'checkStatus',
  },
  timeColumn('reservationOutboundDate', '预约出库日期'),
  {
    title: '出库状态',
    key: 'outStatus',
  },
  {
    title: '运单号',
    key: 'waybillId',
  },
  {
    title: 'REF.',
    key: 'REF',
  },
  {
    title: 'ISA',
    key: 'ISA',
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
    title: 'PO',
    key: 'PO',
  },
  {
    title: '收件地址',
    key: 'deliveryAddress',
  },
  {
    title: '物流方式',
    key: 'deliveryMethod',
  },
  {
    title: '库位',
    key: 'storeAddress',
  },
  {
    title: '存放天数',
    key: 'storageDays',
  },
];

export type OutboundDetailModel = {
  detailId: number;
  OutboundId: string;
  inboundId: number;
  customerId: string;
  ticketId: string;
  containerId: string;
  productSKU: string;
  trayNum: number;
  containerNum: number;
  containerStandards: string;
  weightKg: number;
  volume: string;
  wareHouse: string;
  checkStatus: string;
  reservationOutboundDate: string;
  outStatus: string;
  waybillId: number;
  REF: string;
  ISA: string;
  targetCountry: string;
  FBACode: string;
  PO: string;
  shippingAddress: string;
  logisticsMethods: string;
  storeAddress: string;
  storageDays: string;
};

export const filters: FormField[] = [
  {
    label: '明细ID',
    field: 'outboundDetailId',
  },
  {
    label: '出库ID',
    field: 'outId',
  },
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
    label: '出库状态',
    field: 'outStatus',
  },
  {
    field: 'containerId',
    label: '箱号',
  },
  {
    field: 'checkStatus',
    label: '审核状态',
  },
  {
    field: 'containerNo',
    label: '货柜号',
  },
  {
    field: 'deliveryWay',
    label: '物流方式',
  },
  {
    field: 'NotifyStartDateTime',
    component: 'NDatePicker',
    label: '出库开始时间',
    componentProps: {
      type: 'date',
      clearable: true,
    },
  },
  {
    field: 'NotifyEndDateTime',
    component: 'NDatePicker',
    label: '出库结束时间',
    componentProps: {
      type: 'date',
      clearable: true,
    },
  },
];

export enum CheckStatus {
  NotPassed = '未通过',
  Checked = '已通过',
  Wait = '等待审核',
  Cancel = '取消',
}
