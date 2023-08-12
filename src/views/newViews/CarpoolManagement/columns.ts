import { DataTableColumns } from 'naive-ui';
import { idColumn, timeColumn } from '@/views/bolita-views/composable/useableColumns';
import { asyncCustomerFormField } from '@/api/dataLayer/fieldDefination/common';
import { FormFields } from '@/api/dataLayer/common/GeneralModel';

export const columns: DataTableColumns<CarpoolManagementModel> = [
  idColumn('拼车ID', '/logistic/logisticDetail'),
  timeColumn(),
  {
    title: '仓库',
    key: 'warehouseId',
  },
  {
    title: '托盘',
    key: 'trayNum',
    width: 60,
  },
  {
    title: '箱数',
    key: 'containerNum',
    width: 60,
  },
  {
    title: 'ISA',
    key: 'ISA',
  },
  {
    title: 'REF.',
    key: 'REF',
  },

  timeColumn('reservationGetProductTime', '预约取货日期'),
  {
    title: '总报价',
    key: 'totalPrice',
  },
  {
    title: '运输公司',
    key: 'deliveryCompany',
  },
  {
    title: '总开销',
    key: 'totalCost',
  },
];

export type CarpoolManagementModel = {
  carPoolId: string;
  customerId: string;
  logisticId: string;
  date: string;
  outboundDetailId: number;
  OutboundId: number;
  warehouseId: string;
  trayNum: number;
  containerNum: string;
  outStatus: string;
  targetCountry: string;
  fbaCode: string;
  quotation: string;
  address: number;
  reservationGetProductTime: string;
};

export const filters: FormFields = [
  {
    label: '拼车ID',
    field: 'carPoolID',
  },
  asyncCustomerFormField(),
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
    field: 'warehouseId',
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
    field: 'fbaCode',
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
