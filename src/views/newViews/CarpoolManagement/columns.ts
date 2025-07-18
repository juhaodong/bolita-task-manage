import { DataTableColumns, NButton } from 'naive-ui';
import {
  statusColumnEasy,
  timeAndDateColumn,
  timeColumn,
  timeTableColumn,
} from '@/views/bolita-views/composable/useableColumns';
import { getDatePickerFormField } from '@/api/dataLayer/fieldDefination/common';
import { FormFields } from '@/api/dataLayer/common/GeneralModel';
import { FormField } from '@/views/bolita-views/composable/form-field-type';
import { generateOptionFromArray } from '@/store/utils/utils';
import { reservationTimeList } from '@/views/newViews/ContainerForecast/columns';
import { channelTypeList, vehicleTypeList } from '@/api/newDataLayer/CarManage/ExternalVehicle';
import { h } from 'vue';
import { RouterLink } from 'vue-router';

export const outCarColumns: DataTableColumns<CarpoolManagementModel> = [
  timeColumn('orderDate', '日期'),
  {
    title: '渠道',
    key: 'channelType',
    component: 'NSelect',
    componentProps: {
      options: channelTypeList,
    },
  },
  {
    title: '约车类型',
    key: 'vehicleType',
    component: 'NSelect',
    componentProps: {
      options: vehicleTypeList,
    },
  },
  {
    title: '客户编号',
    key: 'customer.customerName',
  },
  {
    title: '订单号',
    key: 'orderNumber',
  },
  {
    title: '托数(XP/FP)',
    key: 'trayCount',
  },
  {
    title: '箱数Kartons',
    key: 'boxCount',
  },
  {
    title: '可堆叠',
    key: 'stackable',
  },
  {
    title: '是否需要卸货设备',
    key: 'unloadingEquipmentRequired',
  },
  {
    title: '提货地址',
    key: 'pickupAddress',
    width: 300,
  },
  {
    title: '送货地址',
    key: 'deliveryAddress',
    width: 300,
  },
  timeAndDateColumn('pickupDate', '取货日期+时点'),
  timeAndDateColumn('deliveryDate', '送货日期+时点'),
  {
    title: '物流平台订单号',
    key: 'logisticsOrderNumber',
  },
  {
    title: '运营对外报价',
    key: 'publicQuotation',
  },
  {
    title: 'cbm/尺寸/重量',
    key: 'dimensions',
  },
  {
    title: '需求',
    key: 'requirements',
  },
  {
    title: '询价需求',
    key: 'inquiryRequirements',
  },
  {
    title: '是否有送仓文件',
    key: 'hasWarehouseDocuments',
  },
  {
    title: '物流公司',
    key: 'logisticsCompany',
  },
  {
    title: '成本底价',
    key: 'baseCost',
  },
  {
    title: '物流建议报价',
    key: 'suggestedQuotation',
  },
  {
    title: '备注',
    key: 'note',
  },
].map((it) => {
  it.resizable = true;
  return it;
});

export const columns: DataTableColumns<CarpoolManagementModel> = [
  {
    title: '系统Id',
    key: 'id',
  },
  {
    type: 'selection',
  },
  {
    title: 'Ref',
    key: 'ref',
  },
  {
    title: '详情',
    key: 'actions',
    render(row) {
      return h(
        RouterLink,
        {
          to: '/car/carBookingDetail' + '?id=' + row['id'],
        },
        () =>
          h(
            NButton,
            {
              strong: true,
              tertiary: true,
              size: 'small',
            },
            { default: () => '查看' }
          )
      );
    },
  },
  // selectedIdColumn('物流ID', '/car/carBookingDetail', 'id'),
  timeColumn('createTimestamp', '下单日期'),
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
    key: 'totalNumber',
  },
  {
    title: '对外报价',
    key: 'totalOutOffer',
  },
  {
    title: '物流底价',
    key: 'costPrice',
  },
  {
    title: '建议报价',
    key: 'suggestedPrice',
  },
  {
    title: '邮编',
    key: 'postcode',
  },
  {
    title: 'FC/送货地址',
    key: 'fcaddress',
  },
  // {
  //   title: 'PO',
  //   key: 'PO',
  // },

  {
    title: 'ISA',
    key: 'isa',
  },
  {
    title: '物流公司',
    key: 'logisticsCompany',
    width: 100,
  },
  {
    title: 'AX4 Nr./AMZ/车队',
    key: 'amzid',
    width: 200,
  },
  {
    title: '托盘',
    key: 'trayNum',
  },
  timeTableColumn('reservationGetProductTime', '预约取货日期'),
  {
    title: '取货时间',
    key: 'reservationGetProductDetailTime',
  },
  // {
  //   title: '报价',
  //   key: 'orderCarPrice',
  // },
  // {
  //   title: '城市',
  //   key: 'city',
  // },
  // {
  //   title: '街道',
  //   key: 'street',
  // },
  // {
  //   title: '地址附加',
  //   key: 'appendAddress',
  // },
  // {
  //   title: '门牌号',
  //   key: 'houseNo',
  // },
  // {
  //   title: '收件人',
  //   key: 'contact',
  // },
  // {
  //   title: '电话／邮箱',
  //   key: 'email',
  // },
  {
    title: '备注',
    key: 'note',
  },
].map((it) => {
  it.resizable = true;
  return it;
});

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
];

export const carSchemas: FormField[] = [
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
