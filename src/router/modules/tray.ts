import { RouteRecordRaw } from 'vue-router';
import { Layout } from '@/router/constant';
import { renderIcon } from '@/store/utils';
import { BellOutlined } from '@vicons/antd';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/tray',
    name: 'tray',
    component: Layout,
    meta: {
      title: '托盘管理',
      sort: 2,
      isRoot: true,
      icon: renderIcon(BellOutlined),
    },
    children: [
      {
        path: 'index',
        name: `tray_index`,
        meta: {
          title: '托盘管理',
          activeMenu: 'tray_index',
        },
        component: () => import('@/views/newViews/TrayManage/TrayManage.vue'),
      },
    ],
  },
];

export default routes;
