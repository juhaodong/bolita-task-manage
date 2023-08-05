import { RouteRecordRaw } from 'vue-router';
import { Layout } from '@/router/constant';
import { renderIcon } from '@/utils';
import { BellOutlined } from '@vicons/antd';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/carpool',
    name: 'carpool',
    component: Layout,
    meta: {
      title: '拼车管理',
      sort: 5,
      isRoot: true,
      icon: renderIcon(BellOutlined),
    },
    children: [
      {
        path: 'index',
        name: `carpoolManage`,
        meta: {
          title: '拼车管理',
        },
        component: () => import('@/views/newViews/CarpoolManagement/CarpoolManagement.vue'),
      },
    ],
  },
];

export default routes;
