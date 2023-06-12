import { doCustomTimes, resultSuccess } from '../_util';

const salesmanManageList = (pageSize) => {
  const result: any[] = [];
  doCustomTimes(pageSize, () => {
    result.push({
      name: 'admin',
      adminUser: 'admin',
      password: '******',
      'no|100000-10000000': 100000,
    });
  });
  return result;
};

export default [
  //表格数据列表
  {
    url: '/api/salesmanManage/list',
    timeout: 1000,
    method: 'get',
    response: ({ query }) => {
      const { page = 1, pageSize = 10 } = query;
      const list = salesmanManageList(Number(pageSize));
      return resultSuccess({
        page: Number(page),
        pageSize: Number(pageSize),
        pageCount: 60,
        list,
      });
    },
  },
];
