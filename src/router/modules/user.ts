import { RouteRecordRaw } from 'vue-router';
import { Layout } from '@/router/constant';
import { renderIcon } from '@/store/utils';
import { Person } from '@vicons/ionicons5';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/user',
    name: 'user',
    component: Layout,
    meta: {
      title: '系统设置',
      sort: 9,
      isRoot: true,
      icon: renderIcon(Person),
    },
    children: [
      {
        path: 'userManage',
        name: `userManage`,
        meta: {
          title: '用户管理',
        },
        component: () => import('@/views/newViews/UserManage/UserManage.vue'),
      },
      {
        path: 'customer',
        name: `customer`,
        meta: {
          title: '客户管理',
        },
        component: () => import('@/views/newViews/CustomerManage/CustomerManage.vue'),
      },
      {
        path: 'warehouse',
        name: `warehouse`,
        meta: {
          title: '仓库管理',
        },
        component: () => import('@/views/newViews/WarehouseManage/WarehouseManage.vue'),
      },
      // {
      //   path: 'operator',
      //   name: `operator`,
      //   meta: {
      //     title: '操作员管理',
      //     activeMenu: 'salesmanManage_index',
      //   },
      //   component: () => import('@/views/bolita-views/user/operatorManage/list/OperatorIndex.vue'),
      // },
      // {
      //   path: 'sales',
      //   name: `sales`,
      //   meta: {
      //     title: '业务员管理',
      //     activeMenu: 'salesmanManage_index',
      //   },
      //   component: () => import('@/views/bolita-views/user/salesmanManage/list/SalesIndex.vue'),
      // },
    ],
  },
];

export default routes;
