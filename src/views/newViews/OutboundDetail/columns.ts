import { DataTableColumns } from 'naive-ui';
import { timeColumn } from '@/views/bolita-views/composable/useableColumns';

export const columns: DataTableColumns<OutboundDetailModel> = [
  {
    title: '明细ID',
    key: 'outboundDetailId',
  },
  {
    title: '出库ID',
    key: 'OutboundId',
  },
  {
    title: '入库ID',
    key: 'inboundId',
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
    key: 'outState',
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
  outState: string;
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
