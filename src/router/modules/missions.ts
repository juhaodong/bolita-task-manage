import { RouteRecordRaw } from 'vue-router';
import { Layout } from '@/router/constant';
import { renderIcon } from '@/store/utils';
import { BellOutlined } from '@vicons/antd';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/missions',
    name: 'missions',
    component: Layout,
    meta: {
      title: '任务明细',
      sort: 2,
      isRoot: true,
      icon: renderIcon(BellOutlined),
    },
    children: [
      {
        path: 'alreadyWarehousing',
        name: `alreadyWarehousing`,
        meta: {
          title: '已入库',
          activeMenu: 'alreadyWarehousing',
        },
        component: () =>
          import('@/views/newNewViews/Missions/AlreadyWarehousing/AlreadyWarehousing.vue'),
      },
      {
        path: 'notWarehousing',
        name: `notWarehousing`,
        meta: {
          title: '未入库',
        },
        component: () => import('@/views/newNewViews/Missions/NotWarehousing/NotWarehousing.vue'),
      },
    ],
  },
];

export default routes;
