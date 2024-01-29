import { DataTableColumns } from 'naive-ui';
import { finalStatus } from '@/api/dataLayer/modules/notify/notify-api';
import { generateOptionFromArray } from '@/store/utils/utils';
import { FormField } from '@/views/bolita-views/composable/form-field-type';
import { statusColumnEasy, timeColumn } from '@/views/bolita-views/composable/useableColumns';

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
    title: '仓库',
    key: 'warehouseId',
  },
  {
    title: '运单号',
    key: 'deliveryIdIn',
  },
  {
    title: 'FBA/快递单号',
    key: 'FBA/DeliveryCode',
  },
  {
    title: '出库方式',
    key: 'operation',
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
    key: 'FC/Address',
  },
  {
    title: '换单文件',
    key: 'changeOrderFiles',
  },
  {
    title: '托数',
    key: 'trayNum',
  },
  // {
  //   title: '备注/库位',
  //   key: 'note/address',
  // },
  timeColumn('planArriveDateTime', '预期到仓日期'),
  timeColumn('currentDate', '实际到仓日期'),
  timeColumn('deliveryTime', '发货时间'),
  {
    title: 'Ref',
    key: 'Ref',
  },
  // {
  //   title: '运费报价',
  //   key: 'freightQuotation',
  // },
  // {
  //   title: '结算',
  //   key: 'settlement',
  // },
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
  // {
  //   title: '托数(长*宽*高*数)',
  //   key: 'trayNum',
  // },

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
    key: 'needReserve',
  },
  {
    title: '备注',
    key: 'noteIn',
  },
];

export const filters: FormField[] = [
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
];
