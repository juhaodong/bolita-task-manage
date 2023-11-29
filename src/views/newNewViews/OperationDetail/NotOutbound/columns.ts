import { DataTableColumns } from 'naive-ui';
import {
  InBoundStatus,
  notifyType,
  OutAllStatus,
  OutStatus,
} from '@/api/dataLayer/modules/notify/notify-api';
import {
  idColumn,
  sizeColumns,
  statusColumn,
  statusColumnEasy,
  timeColumn,
} from '@/views/bolita-views/composable/useableColumns';
import { FormField } from '@/views/bolita-views/composable/form-field-type';
import { generateOptionFromArray } from '@/store/utils/utils';

export const columns: DataTableColumns<any> = [
  idColumn('出库ID', '/operation/detail'),
  // {
  //   title: '客户ID',
  //   key: 'customerName',
  // },
  // {
  //   title: '业务员',
  //   key: 'salesName',
  // },
  {
    title: '仓库',
    key: 'warehouseId',
  },
  {
    title: '出库方式',
    key: 'deliveryMethod',
  },
  {
    title: '托数',
    key: 'trayNum',
    width: 60,
  },
  {
    title: '箱数',
    key: 'containerNum',
    width: 60,
  },
  ...sizeColumns(),
  timeColumn(),
  statusColumnEasy({
    title: '订车状态',
    key: 'carStatus',
  }),
  timeColumn('reservationOutboundDate', '预约出库日期'),
  {
    title: '时效',
    key: 'ageing',
  },
  {
    title: '出库数量',
    key: 'outboundNum',
  },
  statusColumn('出库状态', 'outStatus'),
  {
    title: '托盘置换',
    key: 'trayChange',
  },
  {
    title: '仓库备注',
    key: 'warehouseNote',
  },
  {
    title: '操作要求',
    key: 'operationRequirement',
  },
  {
    title: '交流',
    key: 'exchange',
  },
  statusColumn('结算情况', 'cashStatus'),
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
