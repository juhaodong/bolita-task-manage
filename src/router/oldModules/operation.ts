import { RouteRecordRaw } from 'vue-router';
import { Layout } from '@/router/constant';
import { renderIcon } from '@/store/utils';
import { Box } from '@vicons/fa';

const name = 'operation';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/' + name,
    name: name,
    component: Layout,
    meta: {
      title: '出库管理',
      sort: 3,
      isRoot: true,
      icon: renderIcon(Box),
    },
    children: [
      {
        path: 'index',
        name: `${name}_index`,
        meta: {
          title: '出库计划',
        },
        component: () => import('@/views/newViews/OutboundPlan/OutboundPlan.vue'),
      },
      {
        path: 'detail',
        name: `${name}_detail`,
        meta: {
          title: '出库明细',
        },
        props: (route) => ({ outId: route.query.id }),
        component: () => import('@/views/newViews/OutboundDetail/OutboundDetail.vue'),
      },
      {
        path: 'inventory',
        name: `${name}_inventory`,
        meta: {
          title: '库存明细',
        },
        component: () => import('@/views/newViews/InventoryDetail/InventoryDetail.vue'),
      },
    ],
  },
];

export default routes;
