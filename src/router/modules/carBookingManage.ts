import { RouteRecordRaw } from 'vue-router';
import { Layout } from '@/router/constant';
import { renderIcon } from '@/store/utils';
import { DeliveryTruck } from '@vicons/carbon';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/car',
    name: 'car',
    component: Layout,
    meta: {
      title: '订车管理',
      sort: 4,
      isRoot: true,
      icon: renderIcon(DeliveryTruck),
    },
    children: [
      {
        path: 'carBooking',
        name: `carBooking`,
        meta: {
          title: '订车管理',
        },
        component: () => import('@/views/newViews/CarpoolManagement/CarpoolManagement.vue'),
      },
      {
        path: 'carBookingDetail',
        name: `carBookingDetail`,
        meta: {
          title: '订车明细',
        },
        component: () => import('@/views/newViews/CarpoolManagement/CarpoolDetail.vue'),
      },
      {
        path: 'carBookingOut',
        name: `carBookingOut`,
        meta: {
          title: '库外订车',
        },
        component: () => import('@/views/newViews/CarpoolManagement/CarpoolOutWarehouse.vue'),
      },
      // {
      //   path: 'logisticService',
      //   name: `logisticService`,
      //   meta: {
      //     title: '物流售后',
      //   },
      //   component: () => import('@/views/newViews/LogisticsService/LogisticsService.vue'),
      // },
    ],
  },
];

export default routes;
