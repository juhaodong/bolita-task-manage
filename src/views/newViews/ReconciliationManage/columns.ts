import { DataTableColumns } from 'naive-ui';
import { statusColumnEasy, timeColumn } from '@/views/bolita-views/composable/useableColumns';
import { FormField } from '@/views/bolita-views/composable/form-field-type';
import { FormFields } from '@/api/dataLayer/common/GeneralModel';
import { generateOptionFromArray } from '@/store/utils/utils';

export const columns: DataTableColumns<ReconciliationModel> = [
  {
    title: '财务ID',
    key: 'id',
  },
  {
    title: '客户ID',
    key: 'customerId',
  },
  timeColumn(),
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
    title: '发票号',
    key: 'invoiceNumber',
  },
  statusColumnEasy({
    title: '回款情况',
    key: 'collectionStatus',
  }),
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

export enum CashCollectionStatus {
  NotCollect = '未收款',
  Collected = '已收款',
}
export const schemas: FormFields = [
  {
    label: '其他系统结算',
    field: 'otherSystemSettlement',
  },
  {
    label: '操作费',
    field: 'OperatingPrice',
  },
  {
    label: '快递结算',
    field: 'deliverySettlement',
  },
  {
    label: '物流费用',
    field: 'logisticsPrice',
  },
  {
    label: '仓储费',
    field: 'inventoryPrice',
  },
  {
    label: '其他费用',
    field: 'otherPrice',
  },
  {
    label: '合计netto',
    field: 'totalNetto',
  },
  {
    label: '发票金额',
    field: 'RMBPrice',
  },
  {
    label: '发票金额',
    field: 'EURPrice',
  },
  {
    label: '发票号',
    field: 'invoiceNumber',
  },
  {
    label: '回款情况',
    field: 'collectionStatus',
    component: 'NSelect',
    componentProps: {
      options: generateOptionFromArray(Object.values(CashCollectionStatus)),
    },
  },
  {
    label: '备注',
    field: 'note',
  },
].map((it: FormField) => {
  it.required = false;
  return it;
});
