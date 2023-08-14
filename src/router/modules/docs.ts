import { RouteRecordRaw } from 'vue-router';
import { Layout } from '@/router/constant';
import { DocumentTextOutline } from '@vicons/ionicons5';
import { renderIcon } from '@/store/utils';
import { PermissionEnums } from '@/api/dataLayer/modules/system/user/baseUser';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/external',
    name: 'https://docs.naiveadmin.com',
    component: Layout,

    meta: {
      title: '项目文档',
      icon: renderIcon(DocumentTextOutline),
      sort: 11,
      permissions: [PermissionEnums.Manager],
    },
  },
];

export default routes;
