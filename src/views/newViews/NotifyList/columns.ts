import { DataTableColumns } from 'naive-ui';
import { NotifyModel } from '@/views/newViews/NotifyList/api/notify-api';
import { standardDateFormat, timeColumn } from '@/views/bolita-views/composable/useableColumns';
import { h } from 'vue';

export const columns: DataTableColumns<NotifyModel> = [
  {
    title: '入库ID',
    key: 'id',
  },
  timeColumn(),
  {
    title: '客户ID',
    key: 'customerId',
  },
  {
    title: '业务员',
    key: 'salesName',
  },
  {
    title: '仓库',
    key: 'warehouseName',
  },
  {
    title: '货柜号',
    key: 'containerNo',
  },
  {
    title: '总数量',
    key: 'totalCount',
  },
  timeColumn('planArriveDateTime', '预计到达时间'),
  timeColumn('reserveTime', '预约仓位', standardDateFormat),
  {
    title: '入库数量',
    key: 'arrivedCount',
    render(record) {
      const display = record.arrivedCount + '/' + record.totalCount;
      return h('div', display);
    },
  },
  {
    title: '入库状态',
    key: 'inStatus',
  },
  {
    title: '入库类型',
    key: 'notifyType',
  },
  {
    title: '货柜类型',
    key: 'containerType',
  },
  {
    title: '出库状态',
    key: 'outStatus',
  },
  {
    title: '备注',
    key: 'note',
  },
  {
    title: '交流',
    key: 'warehouseNote',
  },
  {
    title: '结算情况',
    key: 'cashStatus',
  },
];
