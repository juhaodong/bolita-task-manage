import { DataTableColumns } from 'naive-ui';
import { timeColumn } from '@/views/bolita-views/composable/useableColumns';
import { FormField } from '@/views/bolita-views/composable/form-field-type';

export const columns: DataTableColumns = [
  timeColumn(),
  {
    title: '仓库',
    key: 'warehouseId',
  },
  {
    title: '托盘',
    key: 'trayChange',
  },
  {
    title: '退回托盘数量',
    key: 'backTrayNumber',
  },
  timeColumn('returnTime', '退回时间'),
  {
    title: '备注',
    key: 'note',
  },
];

export const filters: FormField[] = [
  {
    field: 'startTime',
    component: 'NDatePicker',
    label: '开始时间',
    componentProps: {
      type: 'date',
      clearable: true,
    },
  },
  {
    field: 'endTime',
    component: 'NDatePicker',
    label: '结束时间',
    componentProps: {
      type: 'date',
      clearable: true,
    },
  },
  {
    label: '订车ID',
    field: 'id',
  },
  {
    label: '物流ID',
    field: 'logisticId',
  },
  {
    label: '运输公司',
    field: 'deliveryCompany',
  },
];
