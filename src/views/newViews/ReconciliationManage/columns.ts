import { DataTableColumns } from 'naive-ui';
import { timeColumn } from '@/views/bolita-views/composable/useableColumns';
import { FormField } from '@/views/bolita-views/composable/form-field-type';

export const columns: DataTableColumns<ReconciliationModel> = [
  {
    title: '财务ID',
    key: 'id',
  },
  {
    title: '客户ID',
    key: 'customerId',
  },
  {
    title: '客户名称',
    key: 'customerName',
  },
  timeColumn('settlementTime', '结算日期'),
  {
    title: '本系统结算金额',
    key: 'systemSettlementPrice',
  },
  {
    title: '附件',
    key: 'file',
  },
  {
    title: '其他系统结算',
    key: 'otherSystemSettlement',
  },
  {
    title: '操作费',
    key: 'OperatingPrice',
  },
  {
    title: '快递结算',
    key: 'deliverySettlement',
  },
  {
    title: '物流费用',
    key: 'logisticsPrice',
  },
  {
    title: '仓储费',
    key: 'inventoryPrice',
  },
  {
    title: '其他费用',
    key: 'otherPrice',
  },
  {
    title: '合计netto',
    key: 'totalNetto',
  },
  {
    title: '发票金额',
    key: 'RMBPrice',
  },
  {
    title: '发票金额',
    key: 'EURPrice',
  },
  {
    title: '发票号',
    key: 'invoiceNumber',
  },
  {
    title: '回款情况',
    key: 'collectionSituation',
  },
  {
    title: '备注',
    key: 'note',
  },
];

export type ReconciliationModel = {
  id: number;
  customerId: number;
  customerName: string;
  settlementTime: string;
  systemSettlementPrice: string;
  file: string;
  otherSystemSettlement: string;
  OperatingPrice: string;
  deliverySettlement: string;
  logisticsPrice: string;
  inventoryPrice: string;
  otherPrice: string;
  totalNetto: string;
  RMBPrice: string;
  EURPrice: string;
  invoiceNumber: string;
  collectionSituation: string;
  note: number;
};

export const filters: FormField[] = [
  {
    label: '财务ID',
    field: 'id',
  },
  {
    label: '客户ID',
    field: 'customerId',
  },
  {
    label: '发票号',
    field: 'invoiceNumber',
  },
  {
    label: '回款情况',
    field: 'collectionSituation',
  },
  {
    label: '起始日期',
    field: 'notifyId',
  },
  {
    label: '截止日期',
    field: 'OutboundId',
  },
];
