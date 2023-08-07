import { DataTableColumns } from 'naive-ui';
import { timeColumn } from '@/views/bolita-views/composable/useableColumns';
import { FormField } from '@/views/bolita-views/composable/form-field-type';

export const columns: DataTableColumns<InventoryDetailModel> = [
  {
    title: '票号',
    key: 'ticketId',
  },
  {
    title: '入库ID',
    key: 'inboundId',
  },
  {
    title: '客户ID',
    key: 'customerId',
  },
  {
    title: '货柜号',
    key: 'containerNo',
  },
  {
    title: '状态',
    key: 'status',
  },
  {
    title: '托',
    key: 'trayNum',
  },
  {
    title: '数量',
    key: 'containerNum',
  },
  {
    title: '规格',
    key: 'containerStandards',
  },
  {
    title: '重量kg',
    key: 'weightKg',
  },
  {
    title: '体积',
    key: 'volume',
  },
  {
    title: '仓库',
    key: 'wareHouse',
  },
  {
    title: '运单号',
    key: 'waybillId',
  },
  {
    title: '备注',
    key: 'note',
  },
  {
    title: '库位',
    key: 'storeAddress',
  },
  timeColumn('warehousingTime', '入库时间'),
  {
    title: '存放天数',
    key: 'storageDays',
  },
];

export type InventoryDetailModel = {
  ticketId: number;
  inboundId: number;
  customerId: string;
  containerNo: string;
  status: string;
  trayNum: number;
  containerNum: number;
  containerStandards: string;
  weightKg: number;
  volume: string;
  wareHouse: string;
  waybillId: string;
  note: string;
  storeAddress: string;
  warehousingTime: number;
  storageDays: string;
};

export const filters: FormField[] = [
  {
    label: '票号',
    field: 'ticketId',
  },
  {
    label: '入库ID',
    field: 'notifyId',
  },
  {
    label: '客户ID',
    field: 'customerId',
  },
  {
    field: 'containerId',
    label: '箱号',
  },
  {
    field: 'containerNo',
    label: '货柜号',
  },
  {
    label: '仓库',
    field: 'warehouseName',
  },
  {
    field: 'waybillId',
    label: '运单号',
  },
  {
    label: '状态',
    field: 'status',
  },
];
