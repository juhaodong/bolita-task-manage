import { RouteRecordRaw } from 'vue-router';
import { Layout } from '@/router/constant';
import { renderIcon } from '@/store/utils';
import { Person } from '@vicons/ionicons5';
import { PermissionEnums } from '@/api/dataLayer/modules/system/user/baseUser';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/user',
    name: 'user',
    component: Layout,
    meta: {
      title: '系统设置',
      sort: 6,
      isRoot: true,
      permissions: [PermissionEnums.Manager],
      icon: renderIcon(Person),
    },
    children: [
      {
        path: 'warehouse',
        name: `warehouse`,
        meta: {
          title: '仓库管理',
        },
        component: () => import('@/views/newViews/WarehouseManage/WarehouseManage.vue'),
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
        path: 'userManage',
        name: `userManage`,
        meta: {
          title: '用户管理',
        },
        component: () => import('@/views/newViews/UserManage/UserManage.vue'),
      },
      // {
      //   path: 'salesMan',
      //   name: `salesMan`,
      //   meta: {
      //     title: '业务员管理',
      //   },
      //   component: () => import('@/views/newViews/SalesMan/SalesMan.vue'),
      // },
      {
        path: 'FBACode',
        name: `FBACode`,
        meta: {
          title: 'FBACode',
        },
        component: () => import('@/views/newViews/FBACode/FBACode.vue'),
      },
    ],
  },
];

export default routes;
