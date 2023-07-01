import { DataTableColumns } from 'naive-ui';
import { h } from 'vue';
import { QuestModel } from '@/api/quest/quest-type';
import { statusColumn, timeColumn } from '@/views/bolita-views/composable/useableColumns';

export const columns: DataTableColumns<QuestModel> = [
  {
    title: '任务ID',
    key: 'id',
    sorter: 'default',
  },
  {
    title: '仓库ID',
    key: 'warehouseId',
  },
  {
    title: '客户ID',
    key: 'customerId',
  },
  timeColumn(),
  {
    title: '箱数',
    key: 'boxCount',
    width: 90,
  },
  statusColumn,
  {
    title: '完成率',
    key: 'completeRate',
    render(record) {
      return h('div', record.completeRate + '%');
    },
  },
  {
    title: '备注',
    key: 'note',
    width: 80,
  },
];
