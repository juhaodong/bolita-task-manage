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
        path: 'missionDetail',
        name: `missionDetail`,
        meta: {
          title: '任务明细',
          activeMenu: 'missionDetail',
        },
        component: () =>
          import('@/views/newViews/Missions/AlreadyWarehousing/AlreadyWarehousing.vue'),
      },
      // {
      //   path: 'notWarehousing',
      //   name: `notWarehousing`,
      //   meta: {
      //     title: '未入库',
      //   },
      //   component: () => import('@/views/newViews/Missions/NotWarehousing/NotWarehousing.vue'),
      // },
    ],
  },
];

export default routes;
