import { RouteRecordRaw } from 'vue-router';
import { Layout } from '@/router/constant';
import { renderIcon } from '@/store/utils';
import { BellOutlined } from '@vicons/antd';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/reconciliation',
    name: 'reconciliation',
    component: Layout,
    meta: {
      title: '对账管理',
      sort: 2,
      isRoot: true,
      icon: renderIcon(BellOutlined),
    },
    children: [
      {
        path: 'index',
        name: `reconciliation_index`,
        meta: {
          title: '对账管理',
          activeMenu: 'reconciliation_index',
        },
        component: () => import('@/views/newViews/ReconciliationManage/ReconciliationManage.vue'),
      },
    ],
  },
];

export default routes;
