import { DataTableColumns } from 'naive-ui';
import { statusColumnEasy, timeColumn } from '@/views/bolita-views/composable/useableColumns';
import { FormField } from '@/views/bolita-views/composable/form-field-type';
import { FormFields } from '@/api/dataLayer/common/GeneralModel';
import { getDatePickerFormField } from '@/api/dataLayer/fieldDefination/common';

export const columns: DataTableColumns = [
  {
    type: 'selection',
    disabled(row: any) {
      return row?.financeId;
    },
  },
  {
    title: '结算ID',
    key: 'id',
  },
  {
    title: '财务ID',
    key: 'financeId',
  },
  timeColumn('finishTime', '完成日期'),
  {
    title: '货柜号',
    key: 'containerNo',
  },
  {
    title: '客户ID',
    key: 'customerId',
  },

  {
    title: '金额',
    key: 'amount',
  },
  {
    title: '操作ID',
    key: 'operationId',
  },
  statusColumnEasy({
    title: '操作类型',
    key: 'operationType',
  }),
  {
    title: '其他费用',
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
    title: '结算状态',
    key: 'cashStatus',
  },
  {
    title: '时间线',
    key: 'timeLine',
  },
];

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
