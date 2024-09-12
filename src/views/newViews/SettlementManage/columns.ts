import { DataTableColumns } from 'naive-ui';
import { statusColumnEasy, timeColumn } from '@/views/bolita-views/composable/useableColumns';
import { FormField } from '@/views/bolita-views/composable/form-field-type';
import { FormFields } from '@/api/dataLayer/common/GeneralModel';
import { getDatePickerFormField } from '@/api/dataLayer/fieldDefination/common';

export const columnsIn: DataTableColumns = [
  {
    type: 'selection',
    disabled(row: any) {
      return (
        row?.finalStatus === '已对账' ||
        row?.finalStatus === '待确认' ||
        row.containerFinalStatus !== '已结算'
      );
    },
  },
  timeColumn('createTimestamp', '创建日期'),
  statusColumnEasy({
    title: '结算状态',
    key: 'status',
  }),
  {
    title: '货柜号',
    key: 'containerNo',
  },
  {
    title: '客户ID',
    key: 'customer.customerName',
  },
  {
    title: '卸柜费',
    key: 'unloadingFee',
  },
  {
    title: '其他费',
    key: 'otherFee',
  },
  {
    title: '总费用',
    key: 'totalFee',
  },
];

export const columnsOut: DataTableColumns = [
  {
    type: 'selection',
    disabled(row: any) {
      return row?.status === '已对账' || row?.status === '待确认' || row?.status === '已结算';
    },
  },
  timeColumn('createTimestamp', '创建日期'),
  statusColumnEasy({
    title: '结算状态',
    key: 'status',
  }),
  {
    title: '票号',
    key: 'ticketId',
  },
  {
    title: '客户ID',
    key: 'customer.customerName',
  },
  {
    title: '入库费',
    key: 'inboundFee',
  },
  {
    title: '出库费',
    key: 'outboundFee',
  },
  {
    title: '操作费',
    key: 'operateFee',
  },
  {
    title: '特殊操作费',
    key: 'specialOperateFee',
  },
  {
    title: '物流费',
    key: 'deliveryFee',
  },
  {
    title: '耗材费',
    key: 'consumablesFee',
  },
];

export const filters: FormField[] = [
  {
    label: '客户ID',
    field: 'customerName',
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

export const schemas: FormFields = [
  getDatePickerFormField('finishTime', '完成日期'),
  {
    label: '其他费用',
    field: 'otherPrice',
    required: false,
  },
  {
    label: '合计',
    field: 'totalPrice',
    required: false,
  },
  {
    label: '备注',
    field: 'note',
    required: false,
  },
];
