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
      title: '到货计划',
      sort: 2,
      isRoot: true,
      icon: renderIcon(BellOutlined),
    },
    children: [
      {
        path: 'index',
        name: `notify_index`,
        meta: {
          title: '货柜预报',
          activeMenu: 'notify_index',
        },
        component: () => import('@/views/bolita-views/notify/list/Container/NotifyList.vue'),
      },
      {
        path: 'tray',
        name: `notify_tray`,
        meta: {
          title: '托盘/散货预报',
          activeMenu: 'notify_tray',
        },
        component: () => import('@/views/bolita-views/notify/list/Tray/TrayList.vue'),
      },
    ],
  },
];

export default routes;
