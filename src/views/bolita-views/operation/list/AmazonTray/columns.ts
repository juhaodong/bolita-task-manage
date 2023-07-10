import { DataTableColumns } from 'naive-ui';
import { h } from 'vue';
import dayjs from 'dayjs';
import { statusColumn } from '@/views/bolita-views/composable/useableColumns';
import { TaskModel } from '@/api/task/task-types';

export const columns: DataTableColumns<TaskModel> = [
  {
    title: '任务ID',
    key: 'id',
  },
  {
    title: '仓库ID',
    key: 'warehouseId',
  },
  {
    title: '客户ID',
    key: 'customerId',
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
  statusColumn,
  {
    title: '下单日期',
    key: 'createTimestamp',
    width: 110,
    render(record) {
      return h('div', record.operateTime && dayjs(record.operateTime).format('YYYY-MM-DD'));
    },
  },
  {
    title: '发货日期',
    key: 'deliveryDate',
  },
  {
    title: '完成率',
    key: 'completionRate',
    render(record) {
      return h('div', record.completionRate + '%');
    },
  },
];
