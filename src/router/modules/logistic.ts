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
      sort: 4,
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
        component: () => import('@/views/bolita-views/logistic/list/LogisticIndex.vue'),
      },
      {
        path: 'amazon',
        name: `${name}_amazon`,
        meta: {
          title: '亚马逊卡派',
          activeMenu: `${name}_amazon`,
        },
        component: () => import('@/views/bolita-views/logistic/list/LogisticIndex.vue'),
      },
      {
        path: 'amazon',
        name: `${name}_amazon`,
        meta: {
          title: '其他卡派',
          activeMenu: `${name}_amazon`,
        },
        component: () => import('@/views/bolita-views/logistic/list/LogisticIndex.vue'),
      },
      {
        path: 'directSend',
        name: `${name}_amazon`,
        meta: {
          title: '尾程直送',
          activeMenu: `${name}_amazon`,
        },
        component: () => import('@/views/bolita-views/logistic/list/LogisticIndex.vue'),
      },
      {
        path: 'other',
        name: `${name}_amazon`,
        meta: {
          title: '其他',
          activeMenu: `${name}_amazon`,
        },
        component: () => import('@/views/bolita-views/logistic/list/LogisticIndex.vue'),
      },
    ],
  },
];

export default routes;
