import { RouteRecordRaw } from 'vue-router';
import { Layout } from '@/router/constant';
import { renderIcon } from '@/store/utils';
import { Box } from '@vicons/fa';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/operationDetail',
    name: 'operationDetail',
    component: Layout,
    meta: {
      title: '仓库信息',
      sort: 3,
      isRoot: true,
      icon: renderIcon(Box),
      permissions: ['管理员', '运营部前端', '运营部后端', '仓库', '物流部'],
    },
    children: [
      {
        path: 'InventoryDashboard',
        name: `InventoryDashboard`,
        meta: {
          title: '入库任务看板',
          permissions: ['管理员', '运营部前端', '运营部后端', '仓库'],
        },
        component: () => import('@/views/newViews/OperationDetail/InventoryDashboard.vue'),
      },
      {
        path: 'Operation',
        name: `Operation`,
        meta: {
          title: '出库任务看板',
          permissions: ['管理员', '仓库', '物流部'],
        },
        component: () => import('@/views/newViews/OperationDetail/NotOutbound/WaitOperation.vue'),
      },
      // {
      //   path: 'OutMission',
      //   name: `OutMission`,
      //   meta: {
      //     title: '出库任务看板',
      //     permissions: ['管理员', '仓库', '物流部'],
      //   },
      //   component: () =>
      //     import('@/views/newViews/Missions/AlreadyWarehousing/MissionWithCarPage.vue'),
      // },
      {
        path: 'InventoryView',
        name: `InventoryView`,
        meta: {
          title: '库内操作看板',
          permissions: ['管理员', '运营部后端', '仓库'],
        },
        component: () => import('@/views/newViews/OperationDetail/NotOutbound/InventoryView.vue'),
      },
    ],
  },
];

export default routes;
