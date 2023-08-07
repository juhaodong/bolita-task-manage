import { DataTableColumns } from 'naive-ui';
import { timeColumn } from '@/views/bolita-views/composable/useableColumns';
import { FormField } from '@/views/bolita-views/composable/form-field-type';

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

export const filters: FormField[] = [
  {
    label: '拼车ID',
    field: 'carPoolID',
  },
  {
    label: '客户ID',
    field: 'customerId',
  },
  {
    label: '出库ID',
    field: 'OutboundId',
  },
  {
    label: '运输公司',
    field: 'transportationCompany',
  },
  {
    label: '出库状态',
    field: 'outStatus',
  },
  {
    label: '仓库',
    field: 'warehouseName',
  },
  {
    label: '结算情况',
    field: 'settlementSituation',
  },
  {
    field: 'waybillId',
    label: '运单号',
  },
  {
    field: 'ISA',
    label: 'ISA',
  },
  {
    field: 'REF',
    label: 'REF.',
  },
  {
    field: 'FBACode',
    label: 'FBACode',
  },
  {
    field: 'NotifyEndDateTime',
    component: 'NDatePicker',
    label: '预约出库日期',
    componentProps: {
      type: 'date',
      clearable: true,
    },
  },
];
