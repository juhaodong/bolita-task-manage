import { DataTableColumns } from 'naive-ui';
import { statusColumnEasy, timeColumn } from '@/views/bolita-views/composable/useableColumns';
import { FormField } from '@/views/bolita-views/composable/form-field-type';

export const columns: DataTableColumns = [
  // {
  //   title: '客户ID',
  //   key: 'id',
  // },
  {
    title: '客户名称',
    key: 'customerName',
  },
  {
    title: '业务关联方',
    key: 'businessParty',
  },
  {
    title: '所属仓库',
    key: 'warehouseId',
  },
  {
    title: '所属业务员',
    key: 'belongSalesMan',
  },
  statusColumnEasy({
    title: '状态',
    key: 'status',
  }),
  timeColumn('createTimestamp', '创建日期'),
];

export const filters: FormField[] = [
  {
    label: '客户ID',
    field: 'id',
  },
];
