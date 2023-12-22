import { DataTableColumns } from 'naive-ui';
import { timeColumn } from '@/views/bolita-views/composable/useableColumns';
import { getDatePickerFormField } from '@/api/dataLayer/fieldDefination/common';
import { FormFields } from '@/api/dataLayer/common/GeneralModel';
import { FormField } from '@/views/bolita-views/composable/form-field-type';
import { useUserStore } from '@/store/modules/user';
import { CarpoolManagementPower } from '@/api/dataLayer/common/PowerModel';

export const columns: DataTableColumns<CarpoolManagementModel> = [
  {
    title: '物流ID',
    key: 'id',
  },
  {
    title: '操作ID',
    key: 'operateId',
  },
  timeColumn('orderDate', '下单日期'),
  {
    title: '仓库',
    key: 'warehouseId',
  },
  {
    title: '国家',
    key: 'country',
  },
  {
    title: '邮编',
    key: 'postCode',
  },
  {
    title: 'FBACode',
    key: 'FBACode',
  },
  {
    title: 'PO',
    key: 'PO',
  },
  {
    title: '数量',
    key: 'amount',
  },
  {
    title: '总实重',
    key: 'totalWeight',
  },
  {
    title: '总体积',
    key: 'totalVolume',
  },
  {
    title: 'Ref',
    key: 'Ref',
  },
  {
    title: 'AMZ-Sendungs ID',
    key: 'AMZID',
  },
  {
    title: '提货仓库地址',
    key: 'warehouseAddress',
  },
  {
    title: '托盘',
    key: 'trayNum',
  },
  timeColumn('appointmentPickupDate', '预约取货日期'),
  timeColumn('pickupDate', '取货日期'),
  {
    title: '报价',
    key: 'offer',
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
    label: '操作ID',
    field: 'operationID',
  },
  {
    label: '运输公司',
    field: 'deliveryCompany',
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
    label: '运单号',
    field: 'deliveryID',
  },
  {
    field: 'ISA',
    label: 'ISA',
  },
  {
    field: 'PO',
    label: 'PP',
  },
  {
    field: 'REF',
    label: 'REF.',
  },
  {
    field: 'fbaCode',
    label: 'FBACode',
  },
  {
    field: 'paymentStatus',
    label: '付款状态',
  },
];

const AccountPowerList = useUserStore()?.info?.powerList;
export const schemas: FormField[] = [
  {
    field: 'ISA',
    label: 'ISA',
    disableCondition() {
      return !AccountPowerList.includes(CarpoolManagementPower.Edit);
    },
  },
  {
    field: 'totalCost',
    label: '订车价格',
    disableCondition() {
      return !AccountPowerList.includes(CarpoolManagementPower.Edit);
    },
  },
  {
    field: 'billNumber',
    label: '账单号',
    disableCondition() {
      return !AccountPowerList.includes(CarpoolManagementPower.Edit);
    },
  },
  getDatePickerFormField('reservationGetProductTime', '预约取货时间'),
  {
    field: 'REF',
    label: 'REF.',
    disableCondition() {
      return !AccountPowerList.includes(CarpoolManagementPower.Edit);
    },
  },
  {
    field: 'deliveryCompany',
    label: '运输公司',
    disableCondition() {
      return !AccountPowerList.includes(CarpoolManagementPower.Edit);
    },
  },
].map((it) => {
  it.required = false;
  return it;
});
