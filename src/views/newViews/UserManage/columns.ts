import { DataTableColumns } from 'naive-ui';
import { timeColumn } from '@/views/bolita-views/composable/useableColumns';

export const columns: DataTableColumns<UserModel> = [
  {
    title: '用户名',
    key: 'userName',
  },
  {
    title: '名称',
    key: 'realName',
  },
  {
    title: '公司',
    key: 'company',
  },
  {
    title: '部门',
    key: 'department',
  },
  {
    title: '用户类型',
    key: 'userType',
  },
  // {
  //   title: '操作',
  //   key: 'action',
  // },
  {
    title: '备注',
    key: 'note',
  },
  {
    title: '登录名',
    key: 'loginName',
  },
  {
    title: '密码',
    key: 'password',
  },
  timeColumn('creatTime', '创建日期'),
];

export type UserModel = {
  userName: string;
  realName: string;
  company: string;
  department: string;
  userType: string;
  action: string;
  note: string;
  loginName: string;
  password: string;
  creatTime: string;
};

export enum UserType {
  manager = '管理',
  warehouse = '仓库',
  customer = '客户',
  operator = '操作员',
  salesName = '业务员',
  settlement = '结算',
}
