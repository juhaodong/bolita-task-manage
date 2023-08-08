import { DataTableColumns } from 'naive-ui';
import { idColumn, timeColumn } from '@/views/bolita-views/composable/useableColumns';
import { FormField } from '@/views/bolita-views/composable/form-field-type';

export const columns: DataTableColumns<LogisticsDetailModel> = [
  {
    title: '物流ID',
    key: 'id',
  },
  {
    title: '客户ID',
    key: 'customerId',
  },
  {
    title: '拼车ID',
    key: 'carpoolId',
  },
  timeColumn(),
  {
    title: '出库明细ID',
    key: 'outboundDetailId',
  },
  idColumn('出库ID', '/operation/detail', 'outId'),
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
    key: 'outStatus',
  },
  {
    title: '目的国',
    key: 'targetCountry',
  },
  {
    title: '邮编',
    key: 'postCode',
  },
  {
    title: 'FBACode',
    key: 'fbaCode',
  },
  {
    title: '地址',
    key: 'deliveryAddress',
  },
  timeColumn('reservationOutboundDate', '预约取货时间'),
  {
    title: '运单号',
    key: 'waybillId',
  },
  {
    title: '备注',
    key: 'note',
  },
  { title: '报价', key: 'price' },
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
  outStatus: string;
  targetCountry: string;
  fbaCode: string;
  address: string;
  reservationOutboundDate: string;
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

export const filters: FormField[] = [
  {
    label: '拼车ID',
    field: 'carpoolId',
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
    label: '仓库',
    field: 'warehouseName',
  },
  {
    field: 'settlementSituation',
    label: '结算情况',
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
    field: 'fbaCode',
    label: 'FBACode',
  },
  {
    field: 'reservationOutboundDate',
    component: 'NDatePicker',
    label: '预约出库日期',
    componentProps: {
      type: 'date',
      clearable: true,
    },
  },
];
