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
    key: 'customerName',
  },
  timeColumn(),
  {
    title: '本系统结算金额',
    key: 'systemSettlementPrice',
  },
  // {
  //   title: '附件',
  //   key: 'files',
  // },
  {
    title: '其他系统结算',
    key: 'otherSystemSettlement',
  },
  {
    title: '操作费',
    key: 'operateTotal',
  },
  {
    title: '特殊操作费',
    key: 'specialOperateTotal',
  },
  {
    title: '入库费',
    key: 'inboundTotal',
  },
  {
    title: '耗材费',
    key: 'consumablesTotal',
  },
  {
    title: '物流费',
    key: 'deliveryTotal',
  },
  {
    title: '出库费',
    key: 'outboundTotal',
  },
  {
    title: '合计netto',
    key: 'totalPrice',
  },
  {
    title: '发票金额/RMB',
    key: 'RMBPrice',
  },
  {
    title: '发票金额/EUR',
    key: 'EURPrice',
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

export const columnsContainer: DataTableColumns<ReconciliationModel> = [
  {
    title: '财务ID',
    key: 'id',
  },
  {
    title: '客户ID',
    key: 'customerName',
  },
  timeColumn(),
  {
    title: '本系统结算金额',
    key: 'systemSettlementPrice',
  },
  {
    title: '其他系统结算',
    key: 'otherSystemSettlement',
  },
  {
    title: '卸柜费',
    key: 'unloadingCabinetsTotal',
  },
  {
    title: '其他费',
    key: 'otherPriceTotal',
  },
  {
    title: '合计netto',
    key: 'subTotal',
  },
  {
    title: '发票金额/RMB',
    key: 'RMBPrice',
  },
  {
    title: '发票金额/EUR',
    key: 'EURPrice',
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
    field: 'customerName',
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
  NotCollect = '未开票',
  BillCreate = '已开票',
  Collected = '已收款',
}

export const schemas: FormFields = [
  {
    label: '本系统结算金额',
    field: 'systemSettlementPrice',
  },
  {
    label: '其他系统结算',
    field: 'otherSystemSettlement',
  },
  {
    label: '操作费',
    field: 'operateTotal',
  },
  {
    label: '特殊操作费',
    field: 'specialOperateTotal',
  },
  {
    label: '入库费',
    field: 'inboundTotal',
  },
  {
    label: '耗材费',
    field: 'consumablesTotal',
  },
  {
    label: '物流费',
    field: 'deliveryTotal',
  },
  {
    label: '出库费',
    field: 'outboundTotal',
  },
  {
    label: '合计netto',
    field: 'totalPrice',
  },
  {
    label: '发票金额/RMB',
    field: 'RMBPrice',
  },
  {
    label: '发票金额/EUR',
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

export const schemasContainer: FormFields = [
  {
    label: '本系统结算金额',
    field: 'systemSettlementPrice',
  },
  {
    label: '其他系统结算',
    field: 'otherSystemSettlement',
  },
  {
    label: '卸柜费',
    field: 'unloadingCabinetsTotal',
  },
  {
    label: '其他费',
    field: 'otherPriceTotal',
  },
  {
    label: '合计netto',
    field: 'subTotal',
  },
  {
    label: '发票金额/RMB',
    field: 'RMBPrice',
  },
  {
    label: '发票金额/EUR',
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
