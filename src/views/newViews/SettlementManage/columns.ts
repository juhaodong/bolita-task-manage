import { DataTableColumns } from 'naive-ui';
import { timeColumn } from '@/views/bolita-views/composable/useableColumns';
import { FormField } from '@/views/bolita-views/composable/form-field-type';
import { FormFields } from '@/api/dataLayer/common/GeneralModel';
import { getDatePickerFormField } from '@/api/dataLayer/fieldDefination/common';

export const columnsIn: DataTableColumns = [
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
  timeColumn('createTimestamp', '创建日期'),
  timeColumn('updateTimestamp', '修改日期'),
  {
    title: '货柜号',
    key: 'containerNo',
  },
  {
    title: '客户ID',
    key: 'customerId',
  },
  {
    title: '卸柜费',
    key: 'amount',
  },
  {
    title: '其他费',
    key: 'amount',
  },
  {
    title: '总费用',
    key: 'subtotal',
  },
];

export const columnsOut: DataTableColumns = [
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
  timeColumn('createTimestamp', '创建日期'),
  timeColumn('updateTimestamp', '修改日期'),
  {
    title: '货柜号',
    key: 'containerId',
  },
  {
    title: '客户ID',
    key: 'customerId',
  },
  {
    title: '入库费',
    key: 'inboundTotal',
  },
  {
    title: '出库费',
    key: 'outboundTotal',
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
    title: '物流费',
    key: 'deliveryTotal',
  },
  {
    title: '耗材费',
    key: 'consumablesTotal',
  },
  {
    title: '总费用',
    key: 'totalPrice',
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
