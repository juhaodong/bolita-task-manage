import { RouteRecordRaw } from 'vue-router';
import { Layout } from '@/router/constant';
import { renderIcon } from '@/utils';
import { BellOutlined } from '@vicons/antd';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/notify',
    name: 'notify',
    component: Layout,
    meta: {
      title: '入库管理',
      sort: 2,
      isRoot: true,
      icon: renderIcon(BellOutlined),
    },
    children: [
      {
        path: 'index',
        name: `notify_index`,
        meta: {
          title: '入库计划',
          activeMenu: 'notify_index',
        },
        component: () => import('@/views/newViews/NotifyList/NotifyList.vue'),
      },
      {
        path: 'detail',
        name: `notify_detail`,
        meta: {
          title: '入库明细',
        },
        component: () => import('@/views/newViews/NotifyDetail/NotifyDetail.vue'),
      },
      {
        path: 'claimManage',
        name: `claimManage`,
        meta: {
          title: '待认领管理',
          activeMenu: 'claimGoods',
        },
        component: () => import('@/views/newViews/ToBeClaimed/ToBeClaimed.vue'),
      },
    ],
  },
];

export default routes;
