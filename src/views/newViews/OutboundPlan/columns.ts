import { DataTableColumns } from 'naive-ui';
import { idColumn, timeColumn } from '@/views/bolita-views/composable/useableColumns';

export const columns: DataTableColumns<OutboundPlanModel> = [
  idColumn('出库ID', '/notify/detail'),
  {
    title: '客户ID',
    key: 'customerId',
  },
  {
    title: '业务员',
    key: 'salesName',
  },
  {
    title: '仓库',
    key: 'wareHouse',
  },
  {
    title: '物流方式',
    key: 'deliveryWay',
  },
  {
    title: '托数',
    key: 'trayNum',
  },
  {
    title: '箱数',
    key: 'containerNum',
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
    title: '收货地址',
    key: 'shippingAddress',
  },
  timeColumn('createTime', '创建日期'),
  {
    title: '订车状态',
    key: 'carStatus',
  },
  timeColumn('reservationOutboundDate', '预约出库日期'),
  {
    title: '时效',
    key: 'ageing',
  },
  {
    title: '出库数量',
    key: 'outboundNum',
  },
  {
    title: '出库状态',
    key: 'outStatus',
  },
  {
    title: '托盘置换',
    key: 'trayChange',
  },
  {
    title: '仓库备注',
    key: 'warehouseNote',
  },
  {
    title: '操作要求',
    key: 'operateRequired',
  },
  {
    title: '交流',
    key: 'exchange',
  },
  {
    title: '结算情况',
    key: 'cashStatus',
  },
];

export type OutboundPlanModel = {
  OutboundId: number;
  operate: string;
  customerId: number;
  salesName: string;
  toExamine: string;
  wareHouse: string;
  deliveryWay: string;
  trayNum: number;
  containerNum: number;
  targetCountry: string;
  FBACode: number;
  shippingAddress: string;
  createTime: string;
  endTime: string;
  reservationOutboundDate: string;
  ageing: string;
  outboundNum: number;
  outStatus: string;
  trayChange: string;
  voucherAttachment: string;
  warehouseNote: string;
  operateRequired: string;
  exchange: string;
  cashStatus: string;
};

export enum CarStatus {
  Able = '可订车',
  UnAble = '待订车',
}
