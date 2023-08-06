import { DataTableColumns } from 'naive-ui';
import { timeColumn } from '@/views/bolita-views/composable/useableColumns';

export const columns: DataTableColumns<CarpoolManagementModel> = [
  {
    title: '拼车ID',
    key: 'carPoolID',
  },
  {
    title: '客户ID',
    key: 'customerId',
  },
  {
    title: '物流ID',
    key: 'LogisticId',
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
    title: '托盘',
    key: 'trayNum',
  },
  {
    title: '箱数',
    key: 'containerNum',
  },
  {
    title: '出库状态',
    key: 'outStatus',
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
    title: '报价',
    key: 'quotation',
  },
  {
    title: '地址',
    key: 'address',
  },
  timeColumn('reservationGetProductTime', '预约取货日期'),
];

export type CarpoolManagementModel = {
  carPoolID: number;
  customerId: string;
  LogisticId: string;
  date: string;
  outboundDetailId: number;
  OutboundId: number;
  warehouseId: string;
  trayNum: number;
  containerNum: string;
  outStatus: string;
  targetCountry: string;
  FBACode: string;
  quotation: string;
  address: number;
  reservationGetProductTime: string;
};
