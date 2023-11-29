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
          title: '预报',
          activeMenu: 'forecast',
        },
        component: () => import('@/views/newNewViews/ContainerForecast/ContainerForecast.vue'),
      },
      {
        path: 'pickUp',
        name: `pickUp`,
        meta: {
          title: '卡派/散货取货',
        },
        component: () => import('@/views/newNewViews/PickUp/PickUp.vue'),
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
