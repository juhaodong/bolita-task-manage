import { DataTableColumns } from 'naive-ui';
import {
  idColumn,
  statusColumn,
  statusColumnEasy,
  timeColumn,
} from '@/views/bolita-views/composable/useableColumns';
import { FormField } from '@/views/bolita-views/composable/form-field-type';
import { deliveryMethodSelection } from '@/api/dataLayer/fieldDefination/common';

export const columns: DataTableColumns<OutboundPlanModel> = [
  idColumn('出库ID', '/operation/detail'),
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
    key: 'warehouseId',
  },
  {
    title: '出库方式',
    key: 'deliveryMethod',
  },
  {
    title: '托数',
    key: 'trayNum',
    width: 60,
  },
  {
    title: '箱数',
    key: 'containerNum',
    width: 60,
  },
  timeColumn(),
  statusColumnEasy({
    title: '订车状态',
    key: 'carStatus',
  }),
  timeColumn('reservationOutboundDate', '预约出库日期'),
  {
    title: '时效',
    key: 'ageing',
  },
  {
    title: '出库数量',
    key: 'outboundNum',
  },
  statusColumn('出库状态', 'outStatus'),
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
    key: 'operationRequirement',
  },
  {
    title: '交流',
    key: 'exchange',
  },
  statusColumn('结算情况', 'cashStatus'),
];

export type OutboundPlanModel = {
  OutboundId: number;
  operate: string;
  customerId: number;
  salesName: string;
  toExamine: string;
  warehouseId: string;
  deliveryMethod: string;
  trayNum: number;
  containerNum: number;
  targetCountry: string;
  fbaCode: number;
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
  UnAble = '待打托',
  Booked = '已订车',
}

export const filters: FormField[] = [
  {
    label: '票号',
    field: 'ticketId',
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
    label: '业务员',
    field: 'salesName',
  },
  {
    label: '仓库',
    field: 'warehouseId',
  },
  {
    label: '出库状态',
    field: 'outStatus',
  },
  {
    field: 'NotifyStartDateTime',
    component: 'NDatePicker',
    label: '起始日期',
    componentProps: {
      type: 'date',
      clearable: true,
    },
  },
  {
    field: 'NotifyEndDateTime',
    component: 'NDatePicker',
    label: '结束日期',
    componentProps: {
      type: 'date',
      clearable: true,
    },
  },
  ...deliveryMethodSelection,
  {
    label: 'FBACode',
    field: 'fbaCode',
  },
  {
    label: '结算情况',
    field: 'settlementSituation',
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
