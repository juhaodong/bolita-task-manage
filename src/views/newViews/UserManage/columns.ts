import { DataTableColumns } from 'naive-ui';
import { timeColumn } from '@/views/bolita-views/composable/useableColumns';
import { FormField } from '@/views/bolita-views/composable/form-field-type';

export const columns: DataTableColumns = [
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
  timeColumn(),
];

export enum UserType {
  Manager = '管理员',
  Warehouse = '仓库',
  Customer = '客户',
  Operator = '操作员',
  Sales = '业务员',
  Logistic = '物流',
  Cash = '结算',
}

export const filters: FormField[] = [
  {
    label: '名称',
    field: 'realName',
  },
  {
    label: '公司',
    field: 'company',
  },
  {
    label: '部门',
    field: 'department',
  },
];
