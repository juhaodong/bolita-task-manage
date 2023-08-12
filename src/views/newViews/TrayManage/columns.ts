import { DataTableColumns } from 'naive-ui';
import { timeColumn } from '@/views/bolita-views/composable/useableColumns';
import { FormField } from '@/views/bolita-views/composable/form-field-type';

export const columns: DataTableColumns<TrayModel> = [
  {
    title: '拼车ID',
    key: 'id',
  },
  {
    title: '物流ID',
    key: 'logisticId',
  },
  timeColumn('date', '日期'),
  {
    title: '仓库',
    key: 'warehouseId',
  },
  {
    title: '托盘',
    key: 'tray',
  },
  {
    title: '运输公司',
    key: 'deliveryCompany',
  },
  {
    title: '退回托盘数量',
    key: 'backTrayNumber',
  },
  timeColumn('time', '时间'),
  {
    title: '备注',
    key: 'note',
  },
];

export type TrayModel = {
  id: number;
  logisticId: number;
  date: string;
  warehouseName: string;
  tray: string;
  deliveryCompany: string;
  backTrayNumber: number;
  time: string;
  note: string;
};

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
    label: '拼车ID',
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
