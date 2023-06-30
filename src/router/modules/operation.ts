import { RouteRecordRaw } from 'vue-router';
import { Layout } from '@/router/constant';
import { renderIcon } from '@/utils';
import { Box } from '@vicons/fa';

const name = 'operation';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/' + name,
    name: name,
    component: Layout,
    meta: {
      title: '操作管理',
      sort: 3,
      isRoot: true,
      icon: renderIcon(Box),
    },
    children: [
      {
        path: 'index',
        name: `${name}_index`,
        meta: {
          title: '操作管理',
          activeMenu: `${name}_index`,
        },
        component: () => import('@/views/bolita-views/operation/list/OperationList.vue'),
      },
    ],
  },
];

export default routes;
