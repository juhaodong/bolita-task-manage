import { DataTableColumns } from 'naive-ui';
import { timeColumn } from '@/views/bolita-views/composable/useableColumns';
import { FormField } from '@/views/bolita-views/composable/form-field-type';

export const columns: DataTableColumns<CustomerModel> = [
  {
    title: '客户ID',
    key: 'id',
  },
  {
    title: '客户名称',
    key: 'customerName',
  },
  {
    title: '业务关联方',
    key: 'businessParty',
  },
  {
    title: '所属仓库',
    key: 'warehouseId',
  },
  {
    title: '所属业务员',
    key: 'belongSalesName',
  },
  {
    title: '使用系统',
    key: 'useSystem',
  },
  {
    title: '快速账号绑定',
    key: 'quickBindAccount',
  },
  {
    title: '状态',
    key: 'status',
  },
  {
    title: '备注',
    key: 'note',
  },
  timeColumn('creatTime', '创建日期'),
];

export type CustomerModel = {
  customerId: number;
  customerName: string;
  businessParty: string;
  warehouseId: string;
  belongSalesName: string;
  action: string;
  childrenCustomerId: number;
  useSystem: string;
  quickBindAccount: string;
  status: string;
  note: string;
  creatTime: string;
};
export const filters: FormField[] = [
  {
    label: '客户ID',
    field: 'id',
  },
];
