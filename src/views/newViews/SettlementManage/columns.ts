import { DataTableColumns } from 'naive-ui';
import { timeColumn } from '@/views/bolita-views/composable/useableColumns';
import { FormField } from '@/views/bolita-views/composable/form-field-type';

export const columns: DataTableColumns<SettlementManageModel> = [
  {
    title: '结算ID',
    key: 'id',
  },
  {
    title: '财务ID',
    key: 'financeID',
  },
  timeColumn('finishTime', '完成日期'),
  {
    title: '货柜号',
    key: 'containerNo',
  },
  {
    title: '出库状态',
    key: 'outStatus',
  },
  {
    title: '客户ID',
    key: 'customerId',
  },
  {
    title: '入库ID',
    key: 'notifyId',
  },
  {
    title: '金额',
    key: 'notifyPrice',
  },
  {
    title: '出库ID',
    key: 'OutboundId',
  },
  {
    title: '金额',
    key: 'outboundPrice',
  },
  {
    title: '物流ID',
    key: 'logisticId',
  },
  {
    title: '金额',
    key: 'logisticPrice',
  },
  {
    title: '其他费用',
    key: 'otherPriceName',
  },
  {
    title: '金额',
    key: 'otherPrice',
  },
  {
    title: '合计',
    key: 'totalPrice',
  },
  {
    title: '备注',
    key: 'note',
  },
  {
    title: '查单ID',
    key: 'checkId',
  },
  {
    title: '索赔退款',
    key: 'claimMoney',
  },
  {
    title: '结算状态',
    key: 'settlementStatus',
  },
  {
    title: '时间线',
    key: 'timeLine',
  },
];

export type SettlementManageModel = {
  id: string;
  financeID: string;
  finishTime: number;
  containerNo: string;
  outStatus: string;
  customerId: string[];
  notifyId: string;
  notifyPrice: number;
  OutboundId: number;
  outboundPrice: string;
  logisticId: string;
  logisticPrice: string;
  otherPriceName: number;
  otherPrice: string;
  totalPrice: string;
  note: string[];
  LogisticId: string;
  claimMoney: number;
  settlementStatus: number;
  timeLine: string;
};

export const filters: FormField[] = [
  {
    label: '客户ID',
    field: 'customerId',
  },
  {
    label: '货柜号',
    field: 'containerNo',
  },
  {
    label: '查单ID',
    field: 'checkId',
  },
  {
    label: '入库ID',
    field: 'notifyId',
  },
  {
    label: '出库ID',
    field: 'OutboundId',
  },
  {
    label: '物流ID',
    field: 'logisticId',
  },
  {
    label: '结算状态',
    field: 'settlementStatus',
  },
];
