import { DataTableColumns } from 'naive-ui';
import { idColumn, timeColumn } from '@/views/bolita-views/composable/useableColumns';
import { initModel } from '@/api/dataLayer/common/GeneralModel';
import { FormField } from '@/views/bolita-views/composable/form-field-type';
import { generateOptionFromArray } from '@/store/utils/utils';
import {
  InBoundStatus,
  notifyType,
  OutAllStatus,
  OutStatus,
} from '@/api/dataLayer/modules/notify/notify-api';

export const columns: DataTableColumns<any> = [
  idColumn('入库ID', '/notify/detail'),
  timeColumn(),
  // {
  //   title: '客户ID',
  //   key: 'customerName',
  // },
  // {
  //   title: '业务员',
  //   key: 'salesName',
  // },
  {
    title: '自然周',
    key: 'weeks',
  },
  timeColumn('planArriveDateTime', '预约仓位日期'),
  {
    title: '地址',
    key: 'address',
  },
  timeColumn('realArriveDateTime', '实际仓位日期'),
  {
    title: '仓位时间',
    key: 'inHouseTime',
    width: 60,
  },
  {
    title: '托盘',
    key: 'trayNum',
    width: 140,
  },
  {
    title: '卡车号',
    key: 'carNumber',
    width: 140,
  },
  {
    title: 'ISA',
    key: 'ISA',
    width: 140,
  },
  {
    title: '目的地',
    key: 'destination',
    width: 140,
  },
  {
    title: '可约车',
    key: 'bookingCar',
    width: 140,
  },
  timeColumn('pickUpDateTime', '提货时间'),
  {
    title: '提货方',
    key: 'pickUpPerson',
    width: 140,
  },
  {
    title: '明细',
    key: 'detail',
    width: 140,
  },
  {
    title: 'POD',
    key: 'POD',
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

export enum AllOptions {
  SSH9101 = '9101-SSH',
  GW8802 = '8802-GW',
  ZLQQ8804 = '8804-ZLQQ',
  GBL8805 = '8805-天津GBL',
  KYA8806 = '8806-KYA',
  Normal6301 = '6301',
  OY8401 = '8401-欧亚',
  Normal9401 = '9401',
  Normal9801 = '9801',
  HY9601 = '9601-华宇',
  TSD5401 = '5401-TSD',
  HY = 'HY',
  DSL = '大森林',
  Normal4101 = '4101',
  CMC = 'CMC',
}

export const ContainerForecastManager = initModel({
  collectionName: 'ContainerForecast',
  init(value): any {
    return value;
  },
  idPrefix: 'P',
});
