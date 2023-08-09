import { DataTableColumns } from 'naive-ui';
import { timeColumn } from '@/views/bolita-views/composable/useableColumns';

export const columns: DataTableColumns<CustomerModel> = [
  {
    title: '客户ID',
    key: 'customerId',
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
    key: 'belongWarehouse',
  },
  {
    title: '所属业务员',
    key: 'belongSalesName',
  },
  // {
  //   title: '操作',
  //   key: 'action',
  // },
  {
    title: '子客户ID',
    key: 'childrenCustomerId',
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
  belongWarehouse: string;
  belongSalesName: string;
  action: string;
  childrenCustomerId: number;
  useSystem: string;
  quickBindAccount: string;
  status: string;
  note: string;
  creatTime: string;
};
