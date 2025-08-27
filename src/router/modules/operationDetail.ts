import { RouteRecordRaw } from 'vue-router';
import { Layout } from '@/router/constant';
import { renderIcon } from '@/store/utils';
import { Box } from '@vicons/fa';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/operationDetail',
    name: 'operationDetail',
    component: Layout,
    meta: {
      title: '仓库明细',
      sort: 3,
      isRoot: true,
      icon: renderIcon(Box),
    },
    children: [
      {
        path: 'InventoryDashboard',
        name: `InventoryDashboard`,
        meta: {
          title: '入库任务看板',
        },
        component: () => import('@/views/newViews/OperationDetail/InventoryDashboard.vue'),
      },
      {
        path: 'Operation',
        name: `Operation`,
        meta: {
          title: '出库任务看板',
        },
        component: () => import('@/views/newViews/OperationDetail/NotOutbound/WaitOperation.vue'),
      },
      {
        path: 'InventoryView',
        name: `InventoryView`,
        meta: {
          title: '库内操作看板',
        },
        component: () => import('@/views/newViews/OperationDetail/NotOutbound/InventoryView.vue'),
      },
    ],
  },
];

export default routes;
