import { DataTableColumns } from 'naive-ui';
import { TaskModel } from '@/api/task/task-types';

export const columns: DataTableColumns<TaskModel> = [
  {
    title: '任务ID',
    key: 'id',
  },
  {
    title: '分拣码',
    key: 'sortLabel',
  },
  {
    title: '箱数',
    key: 'boxCount',
  },
  {
    title: '业务类型',
    key: 'taskType',
    width: 100,
  },
  {
    title: '备注',
    key: 'note',
  },
];
