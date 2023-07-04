import { DataTableColumns } from 'naive-ui';
import { h } from 'vue';
import { NotifyModel } from '@/api/notify/notify-api';
import { statusColumn, timeColumn } from '@/views/bolita-views/composable/useableColumns';

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
  statusColumn,
  {
    title: '货柜号',
    key: 'containerNo',
  },

  timeColumn('planArriveDateTime', '预计到达时间'),
  timeColumn('reserveTime', '预约仓位'),
  {
    title: '到货情况',
    key: 'totalCount',
    render(data) {
      return h('div', {}, [`${data.arrivedCount}/${data.totalCount}`]);
    },
  },
  timeColumn('arriveTime', '实际到达时间'),

  {
    title: '备注',
    key: 'note',
    width: 100,
  },
];
