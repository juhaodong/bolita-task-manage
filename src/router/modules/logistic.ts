import { RouteRecordRaw } from 'vue-router';
import { Layout } from '@/router/constant';
import { renderIcon } from '@/utils';
import { DeliveryTruck } from '@vicons/carbon';

const name = 'logistic';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/' + name,
    name: name,
    component: Layout,
    meta: {
      title: '物流管理',
      sort: 5,
      isRoot: true,
      icon: renderIcon(DeliveryTruck),
    },
    children: [
      {
        path: 'index',
        name: `${name}_index`,
        meta: {
          title: '物流管理',
          activeMenu: `${name}_index`,
        },
        component: () => import('@/views/bolita-views/logistic/list/index.vue'),
      },
    ],
  },
];

export default routes;
