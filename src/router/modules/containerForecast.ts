import { RouteRecordRaw } from 'vue-router';
import { Layout } from '@/router/constant';
import { renderIcon } from '@/store/utils';
import { BellOutlined } from '@vicons/antd';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/container',
    name: 'container',
    component: Layout,
    meta: {
      title: '货柜预报',
      sort: 1,
      isRoot: true,
      icon: renderIcon(BellOutlined),
    },
    children: [
      {
        path: 'forecast',
        name: `forecast`,
        meta: {
          title: '到货预报',
        },
        component: () => import('@/views/newViews/ContainerForecast/ContainerForecast.vue'),
      },
      {
        path: 'claimManage',
        name: `claimManage`,
        meta: {
          title: '待认领管理',
        },
        component: () => import('@/views/newViews/ToBeClaimed/ToBeClaimed.vue'),
      },
    ],
  },
];

export default routes;
