import { DataTableColumns } from 'naive-ui';
import { finalStatus, InBoundDetailStatus } from '@/api/dataLayer/modules/notify/notify-api';
import { asyncStorage, generateOptionFromArray } from '@/store/utils/utils';
import { FormField } from '@/views/bolita-views/composable/form-field-type';
import {
  statusColumnEasy,
  storageTimeWarnColumn,
  timeColumn,
} from '@/views/bolita-views/composable/useableColumns';
import {
  deliveryMethodList,
  outboundMethodList,
  usefulTimeList,
} from '@/api/dataLayer/modules/deliveryMethod/detail';

export const columns: DataTableColumns<any> = [
  {
    type: 'selection',
    disabled: (row) => row.inStatus !== InBoundDetailStatus.WaitCheck,
  },
  {
    title: '客户ID',
    key: 'customer.customerName',
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
    title: '预报件数',
    key: 'number',
  },
  {
    title: '实际件数',
    key: 'arrivedContainerNum',
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
    title: '尺寸',
    key: 'size',
  },
  statusColumnEasy({
    title: '状态',
    key: 'inStatus',
  }),
  {
    title: '仓库',
    key: 'inventory.name',
  },
  storageTimeWarnColumn('stayTime', '留仓时间'),
  {
    title: '运单号',
    key: 'deliveryIdIn',
  },
  {
    title: '客户备注',
    key: 'normalNote',
  },
  {
    title: 'FBA单号',
    key: 'fbaDeliveryCode',
  },
  {
    title: '出库方式',
    key: 'outboundMethod',
  },
  {
    title: '物流渠道',
    key: 'deliveryMethod',
  },
  {
    title: '操作要求',
    key: 'operationRequire',
  },
  {
    title: '操作备注',
    key: 'operationNote',
  },
  statusColumnEasy({
    title: '结算状态',
    key: 'finalStatus',
  }),
  {
    title: 'po',
    key: 'po',
  },
  {
    title: 'FC/送货地址',
    key: 'fcAddress',
  },
  {
    title: '邮编',
    key: 'postcode',
  },
  statusColumnEasy({
    title: '审核状态',
    key: 'inBoundDetailStatus',
  }),
  {
    title: '换单文件',
    key: 'changeOrderFiles',
  },
  {
    title: '送货备注',
    key: 'transportationNote',
  },
  {
    title: '预报托数',
    key: 'trayNum',
  },
  {
    title: '托盘规格',
    key: 'trayDisplay',
  },
  {
    title: '实际托数',
    key: 'arrivedTrayNum',
  },
  timeColumn('planArriveDateTime', '预期到仓日期'),
  timeColumn('arriveTime', '实际到仓日期'),
  timeColumn('deliveryTime', '发货时间'),
  timeColumn('outBoundTime', '预计取货时间'),
  {
    title: 'Ref',
    key: 'ref',
  },
  {
    title: '仓库备注',
    key: 'note',
  },
  {
    title: '库位',
    key: 'warehouseLocation',
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
    key: 'industrialTrayNum',
  },
  {
    title: '品名',
    key: 'productName',
  },
  {
    title: 'UN号',
    key: 'unNumber',
  },
  {
    title: '收件人',
    key: 'recipient',
  },
  {
    title: '电话',
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
    title: '工业品备注',
    key: 'industrialNote',
  },
];

export const allInStatusList = [
  '等待审核',
  '等待入库',
  '等待卸柜',
  // '等待提交',
  '入库待出库',
  '入库待操作',
  '已计划出库',
  // '已报价',
  '已订车',
  '无需订车',
  '已装车',
  // '已完成',
  '已取消',
  // '已拆分',
  '存仓',
  '全部出库',
];

export const allOutboundMethod = ['散货', '存仓', '大件托盘', '标准托盘'];

export const allDeliveryMethod = ['FBA卡车派送', 'DHL', 'DPD', 'UPS', 'GLS', '其他'];

export const filters: FormField[] = [
  {
    label: '状态',
    field: 'inStatus',
    component: 'NSelect',
    componentProps: {
      options: generateOptionFromArray(allInStatusList),
    },
  },
  {
    label: '结算状态',
    field: 'finalStatus',
    component: 'NSelect',
    componentProps: {
      options: generateOptionFromArray(Object.values(finalStatus)),
    },
  },
  asyncStorage(),
  {
    label: '货柜号',
    field: 'containerId',
  },
  {
    label: '票号',
    field: 'ticketId',
  },
  {
    label: '出库方式',
    field: 'outboundMethod',
    component: 'NSelect',
    componentProps: {
      options: generateOptionFromArray(outboundMethodList),
    },
  },
  {
    label: '物流渠道',
    field: 'deliveryMethod',
    component: 'NSelect',
    componentProps: {
      options: generateOptionFromArray(deliveryMethodList),
    },
  },
  {
    label: '时效',
    field: 'usefulTimeRange',
    component: 'NSelect',
    componentProps: {
      options: generateOptionFromArray(usefulTimeList),
    },
  },
];
