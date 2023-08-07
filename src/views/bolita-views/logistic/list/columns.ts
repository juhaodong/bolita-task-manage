import { DataTableColumns } from 'naive-ui';
import { LogisticModel } from '@/api/dataLayer/modules/deliveryMethod/logistic-type';
import { getTimeColumn } from '@/views/bolita-views/composable/dataTableUtils';

export const columns: DataTableColumns<LogisticModel> = [
  {
    title: '订单号',
    key: 'id',
  },
  {
    title: '仓库',
    key: 'warehouseId',
  },

  getTimeColumn({
    title: '下单时间',
    key: 'orderDate',
  }),
  {
    title: '状态',
    key: 'status',
  },

  {
    title: '箱数',
    key: 'boxCount',
  },
  {
    title: '报价',
    key: 'price',
    width: 75,
  },
  {
    title: '物流渠道',
    key: 'deliveryMethod',
  },
];
