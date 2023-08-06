import { DataTableColumns } from 'naive-ui';
import { NotifyModel } from '@/api/notify/notify-api';
import { timeColumn } from '@/views/bolita-views/composable/useableColumns';

export const columns: DataTableColumns<NotifyModel> = [
  {
    title: '入库ID',
    key: 'inboundId',
  },
  {
    title: '创建时间',
    key: 'id',
  },
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
    key: 'boxCount',
  },
  timeColumn('planArriveDateTime', '预计到达时间'),
  timeColumn('reserveTime', '预约仓位'),
  {
    title: '入库数量',
    key: 'totalCount',
  },
  {
    title: '入库状态',
    key: 'inboundStatus',
  },
  {
    title: '入库类型',
    key: 'inType',
  },
  {
    title: '货柜类型',
    key: 'containerType',
  },
  {
    title: '出库状态',
    key: 'outState',
  },
  {
    title: '备注',
    key: 'note',
  },
  {
    title: '交流',
    key: 'communicate',
  },
  {
    title: '结算情况',
    key: 'compute',
  },
];
