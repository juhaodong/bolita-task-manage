import { DataTableColumns } from 'naive-ui';
import { TaskModel } from '@/api/task/task-api';
import { h } from 'vue';
import dayjs from 'dayjs';

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
  {
    title: '状态',
    key: 'status',
  },
  {
    title: '操作日期',
    key: 'operateTime',
    width: 110,
    render(record) {
      return h(
        'div',
        record.operateTime && dayjs(record.operateTime).format('YYYY-MM-DD HH:mm:ss')
      );
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
  {
    title: '备注',
    key: 'note',
  },
];
