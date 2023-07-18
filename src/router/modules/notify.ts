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
      title: '入库管理',
      sort: 2,
      isRoot: true,
      icon: renderIcon(BellOutlined),
    },
    children: [
      {
        path: 'index',
        name: `notify_index`,
        meta: {
          title: '入库计划',
          activeMenu: 'notify_index',
        },
        component: () => import('@/views/bolita-views/notify/list/NotifyList/NotifyList.vue'),
      },
      {
        path: 'detail',
        name: `notify_detail`,
        meta: {
          title: '入库明细',
        },
        component: () => import('@/views/bolita-views/notify/list/Tray/TrayList.vue'),
      },
      {
        path: 'container',
        name: `container`,
        meta: {
          title: '货柜预报',
          activeMenu: 'container',
        },
        component: () => import('@/views/bolita-views/notify/list/Container/NotifyList.vue'),
      },
      {
        path: 'tray',
        name: `tray`,
        meta: {
          title: '托盘/散货预报',
          activeMenu: 'tray',
        },
        component: () => import('@/views/bolita-views/notify/list/Tray/TrayList.vue'),
      },
    ],
  },
];

export default routes;
