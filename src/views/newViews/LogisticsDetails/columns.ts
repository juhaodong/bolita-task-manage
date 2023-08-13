import { DataTableColumns } from 'naive-ui';
import {
  idColumn,
  statusColumn,
  statusColumnEasy,
  timeColumn,
} from '@/views/bolita-views/composable/useableColumns';
import { FormField } from '@/views/bolita-views/composable/form-field-type';
import { CarStatus } from '@/views/newViews/OutboundPlan/columns';

export const columns: DataTableColumns = [
  {
    type: 'selection',
    disabled(row: any) {
      return row?.carStatus == CarStatus.UnAble;
    },
  },
  idColumn('出库ID', '/operation/detail', 'id'),
  {
    title: '客户ID',
    key: 'customerId',
  },
  statusColumn('订车ID', 'carpoolId'),
  timeColumn(),
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
  statusColumnEasy({
    title: '订车状态',
    key: 'carStatus',
  }),
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
    key: 'deliveryCompany',
  },
  {
    title: '账单号',
    key: 'billNumber',
  },
  {
    title: '价格netto',
    key: 'totalCost',
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
  statusColumn('结算状态', 'logisticCashStatus'),
];

export const filters: FormField[] = [
  {
    label: '订车ID',
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
    field: 'warehouseId',
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
