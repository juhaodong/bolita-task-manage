import { DataTableColumns } from 'naive-ui';
import { timeColumn } from '@/views/bolita-views/composable/useableColumns';

export const columns: DataTableColumns<InventoryManage> = [
  {
    title: '仓库ID',
    key: 'warehouseId',
  },
  {
    title: '公司名称',
    key: 'companyName',
  },
  {
    title: '国家',
    key: 'country',
  },
  {
    title: '地址',
    key: 'address',
  },
  {
    title: '面积',
    key: 'area',
  },
  // {
  //   title: '操作',
  //   key: 'action',
  // },
  {
    title: '结算方式',
    key: 'settlementMethod',
  },
  {
    title: '所属操作员',
    key: 'belongOperator',
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
    title: '快递账号',
    key: 'courierAccount',
  },
  {
    title: '备注',
    key: 'note',
  },
  timeColumn('creatTime', '创建日期'),
];

export type InventoryManage = {
  warehouseId: number;
  companyName: number;
  country: number;
  address: number;
  area: string;
  action: number;
  settlementMethod: number;
  belongOperator: string;
  belongSalesName: string;
  useSystem: string;
  courierAccount: string;
  note: string;
  creatTime: string;
};