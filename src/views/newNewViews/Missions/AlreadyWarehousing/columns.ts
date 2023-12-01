import { DataTableColumns } from 'naive-ui';
import {
  InBoundStatus,
  notifyType,
  OutAllStatus,
  OutStatus,
} from '@/api/dataLayer/modules/notify/notify-api';
import { generateOptionFromArray } from '@/store/utils/utils';
import { FormField } from '@/views/bolita-views/composable/form-field-type';

export const columns: DataTableColumns<any> = [
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
    title: 'FBA/快递单号',
    key: 'FBA/DeliveryCode',
  },
  {
    title: 'PO',
    key: 'PO',
  },
  {
    title: 'FC/送货地址',
    key: 'FC/Address',
  },
  {
    title: '操作',
    key: 'operation',
  },
  {
    title: '换单文件',
    key: 'changeOrderFiles',
  },
  {
    title: '分拣标识',
    key: 'sign',
  },
  {
    title: '包装',
    key: 'package',
  },
  {
    title: '托数',
    key: 'trayNum',
  },
  {
    title: '品名',
    key: 'productName',
  },
  {
    title: 'UN号',
    key: 'UNNumber',
  },
  {
    title: '邮编',
    key: 'postcode',
  },
  {
    title: '街道+门牌号',
    key: 'address1',
  },
  {
    title: '地址2',
    key: 'address2',
  },
  {
    title: '公司名称',
    key: 'companyName',
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
    title: '邮箱',
    key: 'email',
  },
  {
    title: '是否需要预约',
    key: 'needReserve',
  },
  {
    title: '备注',
    key: 'note',
  },
];

export const filters: FormField[] = [
  {
    label: '入库ID',
    field: 'id',
  },
  // {
  //   label: '客户ID',
  //   field: 'customerName',
  // },
  // {
  //   label: '业务员',
  //   field: 'salesName',
  // },
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
