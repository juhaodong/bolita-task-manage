import { DataTableColumns } from 'naive-ui';
import { timeColumn } from '@/views/bolita-views/composable/useableColumns';

export const columns: DataTableColumns<LogisticsDetailModel> = [
  {
    title: '物流ID',
    key: 'LogisticId',
  },
  {
    title: '客户ID',
    key: 'customerId',
  },
  {
    title: '拼车ID',
    key: 'carPoolID',
  },
  timeColumn('date', '日期'),
  {
    title: '出库明细ID',
    key: 'outboundDetailId',
  },
  {
    title: '出库ID',
    key: 'OutboundId',
  },
  {
    title: '仓库',
    key: 'warehouseId',
  },
  {
    title: '提货仓库',
    key: 'getProductWarehouse',
  },
  {
    title: '托盘',
    key: 'trayNum',
  },
  {
    title: '箱数',
    key: 'containerNum',
  },
  {
    title: '出库状态',
    key: 'outState',
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
    title: '地址',
    key: 'address',
  },
  timeColumn('reservationGetProductTime', '预约取货时间'),
  {
    title: '运单号',
    key: 'waybillId',
  },
  {
    title: 'ISA',
    key: 'ISA',
  },
  {
    title: 'REF.',
    key: 'REF',
  },
  {
    title: '备注',
    key: 'note',
  },
  {
    title: '库位',
    key: 'storeAddress',
  },
  {
    title: '运输公司',
    key: 'transportationCompany',
  },
  {
    title: '账单号',
    key: 'billNumber',
  },
  {
    title: '价格netto',
    key: 'priceNetto',
  },
  {
    title: '特殊收费',
    key: 'specialCharges',
  },
  {
    title: '备注',
    key: 'note',
  },
  {
    title: '结算金额',
    key: 'settlementPrice',
  },
  {
    title: '结算情况',
    key: 'settlementSituation',
  },
];

export type LogisticsDetailModel = {
  LogisticId: number;
  customerId: number;
  carPoolID: number;
  date: string;
  outboundDetailId: number;
  OutboundId: number;
  warehouseId: number;
  getProductWarehouse: string;
  trayNum: number;
  containerNum: number;
  outState: string;
  targetCountry: string;
  FBACode: string;
  address: string;
  reservationGetProductTime: string;
  waybillId: string;
  ISA: string;
  REF: string;
  note: string;
  storeAddress: string;
  transportationCompany: string;
  billNumber: string;
  priceNetto: string;
  specialCharges: string;
  settlementPrice: string;
  settlementSituation: string;
};
