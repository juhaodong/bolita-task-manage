import { RouteRecordRaw } from 'vue-router';
import { Layout } from '@/router/constant';
import { renderIcon } from '@/store/utils';
import { DeliveryTruck } from '@vicons/carbon';
import { PermissionEnums } from '@/api/dataLayer/modules/system/user/baseUser';

const name = 'logistic';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/' + name,
    name: name,
    component: Layout,
    meta: {
      title: '物流管理',
      sort: 4,
      isRoot: true,
      icon: renderIcon(DeliveryTruck),
    },
    children: [
      {
        path: 'logisticDetail',
        name: `${name}logisticDetail`,
        meta: {
          title: '物流明细',
        },
        props: (route) => ({ carpoolId: route.query.id }),
        component: () => import('@/views/newViews/LogisticsDetails/LogisticsDetails.vue'),
      },

      {
        path: 'carpoolManage',
        name: `${name}carpoolManage`,
        meta: {
          title: '订车管理',
          permissions: [
            PermissionEnums.Logistic,
            PermissionEnums.Manager,
            PermissionEnums.Operator,
            PermissionEnums.Sales,
            PermissionEnums.Cash,
          ],
        },
        component: () => import('@/views/newViews/CarpoolManagement/CarpoolManagement.vue'),
      },
      {
        path: 'logisticService',
        name: `${name}logisticService`,
        meta: {
          title: '物流售后',
        },
        component: () => import('@/views/newViews/LogisticsService/LogisticsService.vue'),
      },
    ],
  },
];

export default routes;
