import { FormField } from '@/views/bolita-views/composable/form-field-type';
import { FormFields } from '@/api/dataLayer/common/GeneralModel';
import { generateOptionFromArray } from '@/store/utils/utils';

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
