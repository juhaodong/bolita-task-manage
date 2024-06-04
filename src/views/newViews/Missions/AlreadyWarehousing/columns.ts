import { DataTableColumns } from 'naive-ui';
import { finalStatus, InBoundDetailStatus } from '@/api/dataLayer/modules/notify/notify-api';
import { generateOptionFromArray } from '@/store/utils/utils';
import { FormField } from '@/views/bolita-views/composable/form-field-type';
import { statusColumnEasy, timeColumn } from '@/views/bolita-views/composable/useableColumns';

export const columns: DataTableColumns<any> = [
  {
    type: 'selection',
    disabled: (row) => row.inStatus !== InBoundDetailStatus.WaitCheck,
  },
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
    key: 'warehouseId',
  },
  {
    title: '留仓时间',
    key: 'stayTime',
  },
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
    key: 'FBADeliveryCode',
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
    width: 500,
    // ellipsis: {
    //   tooltip: true,
    // },
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
    title: 'PO',
    key: 'PO',
  },
  {
    title: 'FC/送货地址',
    key: 'FCAddress',
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
    title: '实际托数',
    key: 'arrivedTrayNum',
  },
  timeColumn('planArriveDateTime', '预期到仓日期'),
  timeColumn('currentDate', '实际到仓日期'),
  timeColumn('deliveryTime', '发货时间'),
  {
    title: 'Ref',
    key: 'Ref',
  },
  {
    title: '仓库备注',
    key: 'note',
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
    title: '品名',
    key: 'productName',
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
    title: '地址1',
    key: 'address1',
  },
  {
    title: '地址2',
    key: 'address2',
  },
  {
    title: '工业品国家',
    key: 'industrialCountry',
  },
  {
    title: '工业品城市',
    key: 'industrialCity',
  },
  {
    title: '是否需要预约',
    key: 'needReserve',
  },
  {
    title: '备注',
    key: 'industrialNote',
  },
];

const allInStatusList = [
  '待审核',
  '等待入库',
  '入库待出库',
  '已计划出库',
  '已订车',
  '已装车',
  '全部出库',
  '存仓',
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
  {
    label: '仓库',
    field: 'warehouseId',
  },
  {
    label: '货柜号',
    field: 'containerNo',
  },
  {
    label: '票号',
    field: 'ticketId',
  },
  {
    label: '过滤项1',
    field: 'filterTitleOne',
    component: 'NSelect',
    componentProps: {
      options: generateOptionFromArray(columns.filter((it) => it.key).map((it) => it.title)),
    },
  },
  {
    label: '过滤值1',
    field: 'filterKeyOne',
  },
  {
    label: '过滤项2',
    field: 'filterTitleTwo',
    component: 'NSelect',
    componentProps: {
      options: generateOptionFromArray(columns.filter((it) => it.key).map((it) => it.title)),
    },
  },
  {
    label: '过滤值2',
    field: 'filterKeyTwo',
  },
];
