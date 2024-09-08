import { DataTableColumns } from 'naive-ui';
import { timeColumn } from '@/views/bolita-views/composable/useableColumns';
import { FormField } from '@/views/bolita-views/composable/form-field-type';

export const columns: DataTableColumns<InventoryManage> = [
  {
    title: '仓库ID',
    key: 'name',
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
  {
    title: '开放时间',
    key: 'useTimeSpan',
  },
  {
    title: '开放库位',
    key: 'useAmount',
  },
  timeColumn('createTimestamp', '创建日期'),
];

export const filters: FormField[] = [
  {
    label: '仓库ID',
    field: 'id',
  },
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
