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
        path: 'missionDisplay',
        name: `missionDisplay`,
        meta: {
          title: '明细显示',
          activeMenu: 'missionDisplay',
        },
        component: () =>
          import('@/views/newViews/Missions/AlreadyWarehousing/AlreadyWarehousing.vue'),
      },
      {
        path: 'missionOperation',
        name: `missionOperation`,
        meta: {
          title: '明细操作',
          activeMenu: 'missionOperation',
          permissions: ['管理员', '运营部前端', '运营部后端'],
        },
        component: () =>
          import('@/views/newViews/Missions/AlreadyWarehousing/MissionOperationPage.vue'),
      },
      {
        path: 'missionCheckPrice',
        name: `missionCheckPrice`,
        meta: {
          title: '询价看板',
          activeMenu: 'missionCheckPrice',
          permissions: ['管理员', '运营部前端', '运营部后端', '物流部', '仓库'],
        },
        component: () =>
          import('@/views/newViews/Missions/AlreadyWarehousing/MissionCheckPrice.vue'),
      },
    ],
  },
];

export default routes;
