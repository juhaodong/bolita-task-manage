import { RouteRecordRaw } from 'vue-router';
import { Layout } from '@/router/constant';
import { renderIcon } from '@/utils';
import { BoxSearch24Filled } from '@vicons/fluent';

const name = 'claimGoods';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/' + name,
    name: name,
    component: Layout,
    meta: {
      title: '无主货管理',
      sort: 6,
      isRoot: true,
      icon: renderIcon(BoxSearch24Filled),
    },
    children: [
      {
        path: 'index',
        name: `${name}_index`,
        meta: {
          title: '无主货管理',
          activeMenu: `${name}_index`,
        },
        component: () => import('@/views/bolita-views/claimGoods/list/index.vue'),
      },
    ],
  },
];

export default routes;
