import { DataTableColumns } from 'naive-ui';
import { idColumn, timeColumn } from '@/views/bolita-views/composable/useableColumns';
import { FormField } from '@/views/bolita-views/composable/form-field-type';

export const columns: DataTableColumns<any> = [
  timeColumn('uploadDate', '日期'),
  idColumn('操作ID', '/notify/detail'),
  timeColumn('ArrivedDateTime', '到仓日期'),
  timeColumn('OutboundDateTime', '出库日期'),
  {
    title: 'Halle',
    key: 'Halle',
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
    key: 'CustomerId',
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
    title: '地址',
    key: 'address',
  },
  {
    title: '状态',
    key: 'status',
  },
  {
    title: '操作人',
    key: 'operator',
  },
  {
    title: '备注',
    key: 'note',
  },
];

export const filters: FormField[] = [
  {
    label: '票号',
    field: 'id',
  },
  {
    label: '柜号',
    field: 'containerId',
  },
  {
    label: 'Kunden',
    field: 'customerName',
  },
  {
    label: 'Halle',
    field: 'Halle',
  },
  {
    label: '状态',
    field: 'status',
  },
  {
    label: 'ISA',
    field: 'ISA',
  },
  {
    label: 'Ref',
    field: 'Ref',
  },
];
