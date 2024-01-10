import { DataTableColumns } from 'naive-ui';
import {
  InBoundStatus,
  notifyType,
  OutAllStatus,
  OutStatus,
} from '@/api/dataLayer/modules/notify/notify-api';
import { FormField } from '@/views/bolita-views/composable/form-field-type';
import { generateOptionFromArray } from '@/store/utils/utils';
import { timeColumn } from '@/views/bolita-views/composable/useableColumns';

export const columns: DataTableColumns<any> = [
  {
    type: 'selection',
  },
  timeColumn('arriveTime', '到仓日期'),
  timeColumn('outboundDate', '出库日期'),
  {
    title: '出库时间',
    key: 'outboundTime',
  },
  {
    title: 'Halle',
    key: 'warehouseId',
  },
  {
    title: 'Ref',
    key: 'Ref',
  },
  {
    title: 'ISA',
    key: 'ISA',
  },
  {
    title: 'AMZ-Sendungs ID',
    key: 'AMZID',
  },
  {
    title: 'Kunden',
    key: 'Kunden',
  },
  {
    title: '数量',
    key: 'number',
  },
  {
    title: '托数',
    key: 'trayNum',
  },
  {
    title: '出库方式',
    key: 'deliveryMethod',
  },
  {
    title: '地址',
    key: 'customerAddress',
  },
  {
    title: '状态',
    key: 'outStatus',
  },
  {
    title: '操作人',
    key: 'unloadPerson',
  },
  {
    title: '备注',
    key: 'note',
  },
];

export const filters: FormField[] = [
  {
    label: '入库ID',
    field: 'id',
  },
  {
    label: '客户ID',
    field: 'customerName',
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
    label: '入库状态',
    field: 'inStatus',
    component: 'NSelect',
    componentProps: {
      options: generateOptionFromArray(Object.values(InBoundStatus)),
    },
  },
  {
    label: '货柜号',
    field: 'containerNo',
  },
  {
    label: '显示',
    field: 'otherStatus',
    component: 'NSelect',
    componentProps: {
      options: generateOptionFromArray(Object.values(OutAllStatus)),
    },
  },
  {
    label: '出库状态',
    field: 'outStatus',
    component: 'NSelect',
    componentProps: {
      options: generateOptionFromArray(Object.values(OutStatus)),
    },
  },
  {
    label: '入库类型',
    field: 'notifyType',
    component: 'NSelect',
    componentProps: {
      options: generateOptionFromArray(notifyType),
    },
  },
  {
    field: 'planArriveStartDateTime',
    component: 'NDatePicker',
    label: '预计到仓开始时间',
    componentProps: {
      type: 'date',
      clearable: true,
    },
  },
  {
    field: 'planArriveEndDateTime',
    component: 'NDatePicker',
    label: '预计到仓结束时间',
    componentProps: {
      type: 'date',
      clearable: true,
    },
  },
];
