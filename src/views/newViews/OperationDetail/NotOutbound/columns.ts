import { DataTableColumns } from 'naive-ui';
import { InBoundStatus, OutAllStatus } from '@/api/dataLayer/modules/notify/notify-api';
import { FormField } from '@/views/bolita-views/composable/form-field-type';
import { asyncFBACode, generateOptionFromArray } from '@/store/utils/utils';
import { statusColumnEasy } from '@/views/bolita-views/composable/useableColumns';
import { getDatePickerFormField } from '@/api/dataLayer/fieldDefination/common';
import { deliveryMethod } from '@/api/dataLayer/modules/deliveryMethod';
import {
  expressDelivery,
  looseBoxDelivery,
  retainWarehouse,
  transfer,
  trayDelivery,
} from '@/api/dataLayer/modules/deliveryMethod/detail';

export const columns: DataTableColumns<any> = [
  {
    title: 'ID',
    key: 'id',
  },
  {
    title: '出库日期',
    key: 'realOutDate',
  },
  {
    title: 'Halle',
    key: 'warehouseId',
  },
  {
    title: '取货时间',
    key: 'warehouseId',
  },
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
    title: 'Kunden',
    key: 'customerId',
  },
  {
    title: 'FC/送货地址',
    key: 'FCAddress',
  },
  {
    title: '物流方式',
    key: 'deliveryMethod',
  },
  {
    title: '邮编',
    key: 'postcode',
  },
  statusColumnEasy({
    title: '订车状态',
    key: 'carStatus',
  }),
  {
    title: '操作人',
    key: 'outOperatePerson',
  },
  // {
  //   title: '备注',
  //   key: 'operationRequirement',
  // },
];

export const filters: FormField[] = [
  {
    label: '状态',
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

export const schemas: FormField[] = [
  {
    field: 'deliveryMethod',
    label: '出库方式',
    component: 'NSelect',
    required: false,
    componentProps: {
      options: generateOptionFromArray(deliveryMethod),
    },
  },
  {
    field: 'deliveryDetail',
    label: '物流方式',
    component: 'NSelect',
    displayCondition(model) {
      return model.deliveryMethod === '快递';
    },
    componentProps: {
      options: generateOptionFromArray(Object.values(expressDelivery)),
    },
  },
  {
    field: 'deliveryDetail',
    label: '物流方式',
    component: 'NSelect',
    displayCondition(model) {
      return model.deliveryMethod === '托盘';
    },
    componentProps: {
      options: generateOptionFromArray(Object.values(trayDelivery)),
    },
  },
  {
    field: 'deliveryDetail',
    label: '物流方式',
    component: 'NSelect',
    displayCondition(model) {
      return model.deliveryMethod === '散箱';
    },
    componentProps: {
      options: generateOptionFromArray(Object.values(looseBoxDelivery)),
    },
  },
  {
    field: 'deliveryDetail',
    label: '物流方式',
    component: 'NSelect',
    displayCondition(model) {
      return model.deliveryMethod === '留仓';
    },
    componentProps: {
      options: generateOptionFromArray(Object.values(retainWarehouse)),
    },
  },
  {
    field: 'deliveryDetail',
    label: '物流方式',
    component: 'NSelect',
    displayCondition(model) {
      return model.deliveryMethod === '移交';
    },
    componentProps: {
      options: generateOptionFromArray(Object.values(transfer)),
    },
  },
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
  asyncFBACode(),
  {
    field: 'orderCarPrice',
    label: '订车价格',
  },
  getDatePickerFormField('reservationGetProductTime', '预约取货日期'),
  {
    field: 'reservationGetProductDetailTime',
    label: '取货时间',
  },
  {
    field: 'note',
    label: '备注',
  },
].map((it) => {
  it.required = false;
  return it;
});
