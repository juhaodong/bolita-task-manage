import { DataTableColumns } from 'naive-ui';
import { FormField } from '@/views/bolita-views/composable/form-field-type';
import { generateOptionFromArray } from '@/store/utils/utils';
import { statusColumnEasy, timeColumn } from '@/views/bolita-views/composable/useableColumns';
import { CarStatus } from '@/views/newViews/OutboundPlan/columns';

export const columns: DataTableColumns<any> = [
  {
    type: 'selection',
  },
  {
    title: 'ID',
    key: 'id',
  },
  timeColumn('reservationGetProductTime', '预计出库日期'),
  {
    title: '预计出库时间',
    key: 'reservationGetProductDetailTime',
  },
  {
    title: 'Halle',
    key: 'warehouseId',
  },
  {
    title: 'Ref',
    key: 'REF',
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
    key: 'customerId',
  },
  {
    title: '数量',
    key: 'containerNum',
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
    title: 'FC/送货地址',
    key: 'FCAddress',
  },
  statusColumnEasy({
    title: '状态',
    key: 'carStatus',
  }),
  {
    title: '操作人',
    key: 'changeOperator',
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
    label: 'Kunden',
    field: 'customerName',
  },
  {
    label: '业务员',
    field: 'salesName',
  },
  {
    label: 'Halle',
    field: 'warehouseId',
  },
  {
    label: '状态',
    field: 'outStatus',
    component: 'NSelect',
    componentProps: {
      options: generateOptionFromArray(Object.values(CarStatus)),
    },
  },
  {
    label: 'ISA',
    field: 'ISA',
  },
  {
    label: 'Ref',
    field: 'REF',
  },
];
