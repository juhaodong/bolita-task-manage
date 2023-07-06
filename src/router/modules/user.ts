import { RouteRecordRaw } from 'vue-router';
import { Layout } from '@/router/constant';
import { renderIcon } from '@/utils';
import { Person } from '@vicons/ionicons5';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/user',
    name: 'user',
    component: Layout,
    meta: {
      title: '用户管理',
      sort: 1,
      isRoot: true,
      icon: renderIcon(Person),
    },
    children: [
      {
        path: 'customer',
        name: `customer`,
        meta: {
          title: '客户管理',
          activeMenu: 'customerManage_index',
        },
        component: () => import('@/views/bolita-views/user/customerManage/list/CustomerIndex.vue'),
      },
      {
        path: 'warehouse',
        name: `warehouse`,
        meta: {
          title: '仓库管理',
          activeMenu: 'warehouse_index',
        },
        component: () =>
          import('@/views/bolita-views/user/warehouseManage/list/WarehouseIndex.vue'),
      },
      {
        path: 'operator',
        name: `operator`,
        meta: {
          title: '操作员管理',
          activeMenu: 'salesmanManage_index',
        },
        component: () => import('@/views/bolita-views/user/operatorManage/list/OperatorIndex.vue'),
      },
      {
        path: 'sales',
        name: `sales`,
        meta: {
          title: '业务员管理',
          activeMenu: 'salesmanManage_index',
        },
        component: () => import('@/views/bolita-views/user/salesmanManage/list/SalesIndex.vue'),
      },
    ],
  },
];

export default routes;
