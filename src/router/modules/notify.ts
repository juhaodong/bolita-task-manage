import { RouteRecordRaw } from 'vue-router';
import { Layout } from '@/router/constant';
import { renderIcon } from '@/utils';
import { BellOutlined } from '@vicons/antd';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/notify',
    name: 'notify',
    component: Layout,
    meta: {
      title: '到货预报',
      sort: 1,
      isRoot: true,
      icon: renderIcon(BellOutlined),
    },
    children: [
      {
        path: 'index',
        name: `notify_index`,
        meta: {
          title: '到货预报',
          activeMenu: 'notify_index',
        },
        component: () => import('@/views/about/index.vue'),
      },
      {
        path: 'add',
        name: `notify_add`,
        meta: {
          title: '新增到货预报',
          activeMenu: 'notify_add',
        },
        component: () => import('@/views/about/index.vue'),
      },
    ],
  },
];

export default routes;
