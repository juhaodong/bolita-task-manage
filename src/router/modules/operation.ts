import { RouteRecordRaw } from 'vue-router';
import { Layout } from '@/router/constant';
import { renderIcon } from '@/utils';
import { Box } from '@vicons/fa';

const name = 'operation';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/' + name,
    name: name,
    component: Layout,
    meta: {
      title: '操作管理',
      sort: 3,
      isRoot: true,
      icon: renderIcon(Box),
    },
    children: [
      {
        path: 'oneForSend',
        name: `${name}_oneForSend`,
        meta: {
          title: '一件代发',
          activeMenu: `${name}_oneForSend`,
        },
        component: () =>
          import('@/views/bolita-views/operation/list/OneForSend/OneForSendList.vue'),
      },
      {
        path: 'transfer',
        name: `${name}_transfer`,
        meta: {
          title: '转运',
          activeMenu: `${name}_transfer`,
        },
        component: () => import('@/views/bolita-views/operation/list/Transfer/TransferList.vue'),
      },
      {
        path: 'return',
        name: `${name}_return`,
        meta: {
          title: '移仓退货',
          activeMenu: `${name}_return`,
        },
        component: () => import('@/views/bolita-views/operation/list/Return/OperationList.vue'),
      },
      {
        path: 'amazonTray',
        name: `${name}_amazonTray`,
        meta: {
          title: 'AMZ卡派',
          activeMenu: `${name}_amazonTray`,
        },
        component: () => import('@/views/bolita-views/operation/list/AmazonTray/OperationList.vue'),
      },
      {
        path: 'otherTray',
        name: `${name}_otherTray`,
        meta: {
          title: '卡派',
          activeMenu: `${name}_otherTray`,
        },
        component: () => import('@/views/bolita-views/operation/list/OtherTray/OperationList.vue'),
      },
    ],
  },
];

export default routes;
