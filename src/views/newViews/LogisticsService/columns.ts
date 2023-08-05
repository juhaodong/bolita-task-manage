import { DataTableColumns } from 'naive-ui';
import { timeColumn } from '@/views/bolita-views/composable/useableColumns';

export const columns: DataTableColumns<LogisticsServiceModel> = [
  {
    title: '查单ID',
    key: 'LogisticId',
  },
  {
    title: '票号/订单号',
    key: 'ticketId',
  },
  {
    title: '出库ID',
    key: 'OutboundId',
  },
  {
    title: '客户ID',
    key: 'customerId',
  },
  {
    title: '物流方式',
    key: 'deliveryWay',
  },
  {
    title: '物流渠道',
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
    title: '上传附件',
    key: 'uploadFile',
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
  {
    title: '处理状态',
    key: 'handlingStatus',
  },
  {
    title: '申请金额',
    key: 'applicationsAmount',
  },
  {
    title: '索赔金额',
    key: 'claimAmount',
  },
  {
    title: '结算状态',
    key: 'settlementStatus',
  },
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
