import { RouteRecordRaw } from 'vue-router';
import { Layout } from '@/router/constant';
import { renderIcon } from '@/utils';
import { Angry } from '@vicons/fa';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/damageClaim',
    name: 'damageClaim',
    component: Layout,
    meta: {
      title: '索赔管理',
      sort: 6,
      isRoot: true,
      icon: renderIcon(Angry),
    },
    children: [
      {
        path: 'index',
        name: `damageClaim_index`,
        meta: {
          title: '索赔管理',
          activeMenu: 'damageClaim_index',
        },
        component: () => import('@/views/bolita-views/damageClaim/list/index.vue'),
      },
    ],
  },
];

export default routes;
