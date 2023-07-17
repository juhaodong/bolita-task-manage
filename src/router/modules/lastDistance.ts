import { RouteRecordRaw } from 'vue-router';
import { Layout } from '@/router/constant';
import { renderIcon } from '@/utils';
import { DeliveryTruck } from '@vicons/carbon';

const name = 'lastDistance';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/' + name,
    name: name,
    component: Layout,
    meta: {
      title: '尾程直送',
      sort: 5,
      isRoot: true,
      icon: renderIcon(DeliveryTruck),
    },
    children: [
      {
        path: 'index',
        name: `${name}_index`,
        meta: {
          title: '整柜尾程直送',
          activeMenu: `${name}_index`,
        },
        component: () => import('@/views/bolita-views/logistic/list/LogisticIndex.vue'),
      },

      {
        path: 'other',
        name: `${name}_amazon`,
        meta: {
          title: '拼车直送',
        },
        component: () => import('@/views/bolita-views/logistic/list/LogisticIndex.vue'),
      },
    ],
  },
];

export default routes;
