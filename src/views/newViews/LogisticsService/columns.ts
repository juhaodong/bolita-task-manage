import { DataTableColumns } from 'naive-ui';
import { statusColumnEasy, timeColumn } from '@/views/bolita-views/composable/useableColumns';
import { FormField } from '@/views/bolita-views/composable/form-field-type';

export const columns: DataTableColumns<LogisticsServiceModel> = [
  {
    title: '查单ID',
    key: 'id',
  },
  timeColumn(),
  {
    title: '票号/订单号',
    key: 'ticketId',
  },

  {
    title: '出库ID',
    key: 'outId',
  },
  {
    title: '客户ID',
    key: 'customerName',
  },
  {
    title: '出库方式',
    key: 'deliveryMethod',
  },
  {
    title: '运单号',
    key: 'waybillId',
  },
  {
    title: 'ISA',
    key: 'ISA',
  },
  {
    title: '异常描述',
    key: 'wrongDescribe',
  },
  {
    title: '仓库反馈',
    key: 'warehouseFeedback',
  },
  timeColumn('checkDate', '开查时间'),
  timeColumn('endDate', '截止时间'),
  {
    title: '处理进度',
    key: 'processingProgress',
  },
  {
    title: '处理反馈',
    key: 'handlingFeedback',
  },
  {
    title: '索赔号',
    key: 'claimantID',
  },
  statusColumnEasy({
    title: '处理状态',
    key: 'handleStatus',
  }),
  {
    title: '申请金额',
    key: 'applicationsAmount',
  },
  {
    title: '索赔金额',
    key: 'claimAmount',
  },
  statusColumnEasy({
    title: '结算状态',
    key: 'cashStatus',
  }),
];

export type LogisticsServiceModel = {
  LogisticId: number;
  ticketId: number;
  OutboundId: number;
  customerId: string;
  deliveryWay: string;
  deliveryMethod: string;
  waybillId: number;
  ISA: string;
  wrongDescribe: string;
  uploadFile: string;
  warehouseFeedback: string;
  checkDate: string;
  endDate: string;
  processingProgress: string;
  handlingFeedback: string;
  claimantID: number;
  handlingStatus: string;
  applicationsAmount: string;
  claimAmount: string;
  settlementStatus: string;
};

export const filters: FormField[] = [
  {
    label: '票号',
    field: 'ticketId',
  },
  {
    label: '客户ID',
    field: 'customerName',
  },
  {
    label: '出库ID',
    field: 'OutboundId',
  },
  {
    field: 'waybillId',
    label: '运单号',
  },
  {
    field: 'ISA',
    label: 'ISA',
  },
  {
    label: '处理状态',
    field: 'handlingStatus',
  },
];
