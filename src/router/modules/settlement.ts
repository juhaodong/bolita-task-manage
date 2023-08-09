import { RouteRecordRaw } from 'vue-router';
import { Layout } from '@/router/constant';
import { renderIcon } from '@/store/utils';
import { BellOutlined } from '@vicons/antd';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/settlement',
    name: 'settlement',
    component: Layout,
    meta: {
      title: '结算管理',
      sort: 2,
      isRoot: true,
      icon: renderIcon(BellOutlined),
    },
    children: [
      {
        path: 'index',
        name: `settlement_index`,
        meta: {
          title: '结算管理',
          activeMenu: 'settlement_index',
        },
        component: () => import('@/views/newViews/SettlementManage/SettlementManage.vue'),
      },
    ],
  },
];

export default routes;
