import { http } from '@/utils/http/axios';
export type salesmanManageModel = {
  name: string;
  adminUser: string;
  password: string;
};

//获取table
export function getSalesList(params) {
  return http.request({
    url: '/salesmanManage/list',
    method: 'get',
    params,
  });
}
