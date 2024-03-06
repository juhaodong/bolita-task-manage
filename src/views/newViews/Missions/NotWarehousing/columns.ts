import { DataTableColumns } from 'naive-ui';
import {
  InBoundStatus,
  notifyType,
  OutAllStatus,
  OutStatus,
} from '@/api/dataLayer/modules/notify/notify-api';
import { FormField } from '@/views/bolita-views/composable/form-field-type';
import { generateOptionFromArray } from '@/store/utils/utils';
import { timeColumn } from '@/views/bolita-views/composable/useableColumns';

export const columns: DataTableColumns<any> = [
  {
    title: '客户ID',
    key: 'customerName',
  },
  {
    title: '柜号',
    key: 'containerId',
  },
  {
    title: '票号',
    key: 'ticketId',
  },
  {
    title: '国家',
    key: 'country',
  },
  {
    title: '件数',
    key: 'number',
  },
  {
    title: '总实重',
    key: 'weight',
  },
  {
    title: '总体积',
    key: 'volume',
  },
  {
    title: '运单号',
    key: 'deliveryIdIn',
  },
  {
    title: 'FBA/快递单号',
    key: 'FBADeliveryCode',
  },
  {
    title: '出库方式',
    key: 'operation',
  },
  {
    title: 'PO',
    key: 'PO',
  },
  {
    title: 'FC/送货地址',
    key: 'FCAddress',
  },
  {
    title: '换单文件',
    key: 'changeOrderFiles',
  },
  {
    title: '托数',
    key: 'trayNum',
  },
  {
    title: '备注/库位',
    key: 'note/address',
  },
  timeColumn('arriveDateTime', '到仓时间'),
  timeColumn('deliveryTime', '发货时间'),
  {
    title: 'Ref',
    key: 'Ref',
  },
  {
    title: '运费报价',
    key: 'freightQuotation',
  },
  {
    title: '结算',
    key: 'settlement',
  },
  {
    title: '分拣标识',
    key: 'sign',
  },
  {
    title: '托数(长*宽*高*数)',
    key: 'totalTrayNum',
  },

  {
    title: '城市',
    key: 'city',
  },
  {
    title: '街道',
    key: 'street',
  },
  {
    title: '门牌号',
    key: 'houseNumber',
  },
  {
    title: '收件人',
    key: 'recipient',
  },
  {
    title: '联系电话',
    key: 'phone',
  },
  {
    title: '是否需要预约',
    key: 'needReservation',
  },
  {
    title: '包装',
    key: 'package',
  },
  {
    title: '品名',
    key: 'productName',
  },
  {
    title: '备注',
    key: 'addressNote',
  },
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
