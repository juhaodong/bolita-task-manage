import { RouteRecordRaw } from 'vue-router';
import { Layout } from '@/router/constant';
import { renderIcon } from '@/utils';
import { BellOutlined } from '@vicons/antd';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/inventory',
    name: 'inventory',
    component: Layout,
    meta: {
      title: '库存管理',
      sort: 4,
      isRoot: true,
      icon: renderIcon(BellOutlined),
    },
    children: [
      {
        path: 'index',
        name: `inventoryManage`,
        meta: {
          title: '库存明细',
        },
        component: () => import('@/views/newViews/InventoryDetail/InventoryDetail.vue'),
      },
    ],
  },
];

export default routes;
