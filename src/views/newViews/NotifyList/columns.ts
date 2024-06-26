import { DataTableColumns } from 'naive-ui';
import {
  InBoundStatus,
  notifyType,
  OutAllStatus,
  OutStatus,
} from '@/api/dataLayer/modules/notify/notify-api';
import {
  idColumn,
  standardDateFormat,
  statusColumn,
  statusColumnEasy,
  timeColumn,
} from '@/views/bolita-views/composable/useableColumns';
import { h } from 'vue';
import { FormField } from '@/views/bolita-views/composable/form-field-type';
import { generateOptionFromArray } from '@/store/utils/utils';

export const columns: DataTableColumns<any> = [
  idColumn('入库ID', '/notify/detail'),
  timeColumn(),
  {
    title: '客户ID',
    key: 'customerName',
  },
  {
    title: '业务员',
    key: 'salesName',
  },
  {
    title: '仓库',
    key: 'warehouseId',
    width: 60,
  },
  {
    title: '货柜号',
    key: 'containerNo',
    width: 140,
  },
  timeColumn('planArriveDateTime', '预计到达时间'),
  timeColumn('reserveTime', '预约仓位', standardDateFormat),
  {
    title: '入库数量',
    key: 'arrivedCount',
    render(record) {
      const display = record.arrivedCount + '/' + record.totalCount;
      return h('div', display);
    },
  },
  statusColumn('入库状态', 'inStatus'),
  {
    title: '入库类型',
    key: 'notifyType',
  },
  {
    title: '货柜类型',
    key: 'containerType',
  },
  statusColumnEasy({
    title: '出库状态',
    key: 'outStatus',
  }),
  {
    title: '备注',
    key: 'note',
  },
  statusColumnEasy({
    title: '结算情况',
    key: 'cashStatus',
  }),
];

export const filters: FormField[] = [
  {
    label: '入库ID',
    field: 'id',
  },
  {
    label: '客户ID',
    field: 'customerName',
  },
  {
    label: '业务员',
    field: 'salesName',
  },
  {
    label: '仓库',
    field: 'warehouseId',
  },
  {
    label: '入库状态',
    field: 'inStatus',
    component: 'NSelect',
    componentProps: {
      options: generateOptionFromArray(Object.values(InBoundStatus)),
    },
  },
  {
    label: '货柜号',
    field: 'containerNo',
  },
  {
    label: '显示',
    field: 'otherStatus',
    defaultValue: OutAllStatus.NotAll,
    component: 'NSelect',
    componentProps: {
      options: generateOptionFromArray(Object.values(OutAllStatus)),
    },
  },
  {
    label: '出库状态',
    field: 'outStatus',
    component: 'NSelect',
    componentProps: {
      options: generateOptionFromArray(Object.values(OutStatus)),
    },
  },
  {
    label: '入库类型',
    field: 'notifyType',
    component: 'NSelect',
    componentProps: {
      options: generateOptionFromArray(notifyType),
    },
  },
  {
    field: 'planArriveStartDateTime',
    component: 'NDatePicker',
    label: '预计到仓开始时间',
    componentProps: {
      type: 'date',
      clearable: true,
    },
  },
  {
    field: 'planArriveEndDateTime',
    component: 'NDatePicker',
    label: '预计到仓结束时间',
    componentProps: {
      type: 'date',
      clearable: true,
    },
  },
];
