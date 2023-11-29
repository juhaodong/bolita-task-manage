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
      title: '操作明细',
      sort: 3,
      isRoot: true,
      icon: renderIcon(Box),
    },
    children: [
      {
        path: 'alreadyOutbound',
        name: `alreadyOutbound`,
        meta: {
          title: '已出库',
        },
        component: () =>
          import('@/views/newNewViews/OperationDetail/AlreadyOutbound/AlreadyOutbound.vue'),
      },
      {
        path: 'waitOperation',
        name: `waitOperation`,
        meta: {
          title: '待操作',
        },
        component: () =>
          import('@/views/newNewViews/OperationDetail/NotOutbound/WaitOperation.vue'),
      },
    ],
  },
];

export default routes;
