import { DataTableColumns } from 'naive-ui';
import {
  selectedIdColumn,
  statusColumnEasy,
  timeColumn,
} from '@/views/bolita-views/composable/useableColumns';
import { getDatePickerFormField } from '@/api/dataLayer/fieldDefination/common';
import { FormFields } from '@/api/dataLayer/common/GeneralModel';
import { FormField } from '@/views/bolita-views/composable/form-field-type';
import { generateOptionFromArray } from '@/store/utils/utils';
import { reservationTimeList } from '@/views/newViews/ContainerForecast/columns';

export const columns: DataTableColumns<CarpoolManagementModel> = [
  // {
  //   title: '物流ID',
  //   key: 'id',
  // },
  selectedIdColumn('物流ID', '/car/carBookingDetail', 'id'),
  timeColumn('createBookCarTimestamp', '下单日期'),
  statusColumnEasy({
    title: '状态',
    key: 'inStatus',
  }),
  {
    title: '出库方式',
    key: 'deliveryMethod',
  },
  {
    title: '运单号',
    key: 'waybillId',
  },
  {
    title: '总托数',
    key: 'trayNum',
  },
  {
    title: '总件数',
    key: 'containerNum',
  },
  // {
  //   title: '国家',
  //   key: 'country',
  // },
  {
    title: '邮编',
    key: 'postcode',
  },
  {
    title: 'FC/送货地址',
    key: 'FCAddress',
  },
  // {
  //   title: 'PO',
  //   key: 'PO',
  // },
  {
    title: 'Ref',
    key: 'REF',
  },
  {
    title: 'ISA',
    key: 'ISA',
  },
  {
    title: 'AMZ-Sendungs ID',
    key: 'AMZID',
  },
  {
    title: '托盘',
    key: 'trayNum',
  },
  timeColumn('reservationGetProductTime', '预约取货日期'),
  {
    title: '取货时间',
    key: 'reservationGetProductDetailTime',
  },
  {
    title: '报价',
    key: 'orderCarPrice',
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
    title: '地址附加',
    key: 'appendAddress',
  },
  {
    title: '门牌号',
    key: 'houseNo',
  },
  {
    title: '收件人',
    key: 'contact',
  },
  {
    title: '电话／邮箱',
    key: 'email',
  },
  {
    title: '备注',
    key: 'note',
  },
];

export type CarpoolManagementModel = {
  carpoolId: string;
  customerId: string;
  logisticId: string;
  date: string;
  outboundDetailId: number;
  OutboundId: number;
  warehouseId: string;
  trayNum: number;
  containerNum: string;
  outStatus: string;
  targetCountry: string;
  fbaCode: string;
  quotation: string;
  address: number;
  reservationGetProductTime: string;
};
export const filters: FormFields = [
  {
    label: '物流ID',
    field: 'deliveryId',
  },
  {
    label: '仓库',
    field: 'warehouseId',
  },
  {
    label: '结算情况',
    field: 'settlement',
  },
  {
    label: '过滤项',
    field: 'filterTitle',
    component: 'NSelect',
    componentProps: {
      options: generateOptionFromArray(columns.filter((it) => it.key).map((it) => it.title)),
    },
  },
  {
    label: '过滤值',
    field: 'filterKey',
  },
];

export const offerSchemas: FormField[] = [
  {
    field: 'REF',
    label: 'REF.',
  },
  {
    field: 'ISA',
    label: 'ISA',
  },
  {
    field: 'AMZID',
    label: 'AMZ-Sendungs ID',
  },
  {
    field: 'waybillId',
    label: '运单号',
  },
  {
    field: 'suggestedPrice',
    label: '建议报价',
  },
  {
    field: 'costPrice',
    label: '成本价',
  },
  {
    field: 'externalPrice',
    label: '对外报价',
    disableCondition() {
      return true;
    },
  },
].map((it) => {
  it.required = false;
  return it;
});

export const carSchemas: FormField[] = [
  getDatePickerFormField('reservationGetProductTime', '预约取货日期'),
  {
    field: 'reservationGetProductDetailTime',
    label: '取货时间',
    component: 'NSelect',
    defaultValue: '',
    componentProps: {
      options: generateOptionFromArray(reservationTimeList),
    },
  },
  {
    field: 'note',
    label: '备注',
  },
].map((it) => {
  it.required = false;
  return it;
});
