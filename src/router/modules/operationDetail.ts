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
        path: 'Operation',
        name: `Operation`,
        meta: {
          title: '操作明细',
        },
        component: () => import('@/views/newViews/OperationDetail/NotOutbound/WaitOperation.vue'),
      },
    ],
  },
];

export default routes;
