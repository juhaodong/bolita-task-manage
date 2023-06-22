import { DataTableColumns } from 'naive-ui';
import { h } from 'vue';
import { NotifyModel } from '@/api/notify/notify-api';
import dayjs from 'dayjs';

export const columns: DataTableColumns<NotifyModel> = [
  {
    title: '预报ID',
    key: 'id',
    width: 100,
  },
  {
    title: '客户ID',
    key: 'customerId',
    width: 100,
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
  },
  {
    title: '到货类型',
    key: 'arriveMedia',
  },
  {
    title: '到货仓库ID',
    key: 'arriveWarehouseId',
  },
  {
    title: '箱数',
    key: 'totalCount',
    render(data) {
      return h('div', {}, [`${data.arrivedCount}/${data.totalCount}`]);
    },
  },
  {
    title: '预约仓位',
    key: 'planArriveDateTime',
    render(data) {
      return h('div', {}, [dayjs(data.planArriveDateTime).format('YYYY-MM-DD HH:mm')]);
    },
  },
  {
    title: '备注',
    key: 'note',
    width: 100,
  },
];
