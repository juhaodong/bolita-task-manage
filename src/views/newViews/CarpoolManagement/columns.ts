import { DataTableColumns } from 'naive-ui';
import { idColumn, timeColumn } from '@/views/bolita-views/composable/useableColumns';
import {
  asyncCustomerFormField,
  getDatePickerFormField,
} from '@/api/dataLayer/fieldDefination/common';
import { FormFields } from '@/api/dataLayer/common/GeneralModel';
import { FormField } from '@/views/bolita-views/composable/form-field-type';
import { yesOrNo } from '@/api/dataLayer/modules/operationType';
import { generateOptionFromArray } from '@/store/utils/utils';
import { usePermission } from '@/hooks/web/usePermission';
import { useUserStore } from '@/store/modules/user';
import { CarpoolManagementPower } from '@/api/dataLayer/common/PowerModel';

const { hasPermission } = usePermission();

export const columns: DataTableColumns<CarpoolManagementModel> = [
  idColumn('订车ID', '/logistic/logisticDetail'),
  timeColumn(),
  {
    title: '仓库',
    key: 'warehouseId',
  },
  {
    title: '托盘',
    key: 'trayNum',
    width: 60,
  },
  {
    title: '箱数',
    key: 'containerNum',
    width: 60,
  },

  timeColumn('reservationGetProductTime', '预约取货日期'),
  {
    title: '总报价',
    key: 'totalPrice',
  },
  {
    title: '运输公司',
    key: 'deliveryCompany',
  },
  {
    title: '总开销',
    key: 'totalCost',
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
    label: '订车ID',
    field: 'carpoolId',
  },
  asyncCustomerFormField(),
  {
    label: '是否拼车',
    field: 'filterIsYes',
    component: 'NSelect',
    componentProps: {
      options: generateOptionFromArray(yesOrNo),
    },
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
    field: 'ISA',
    label: 'ISA',
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
    field: 'NotifyEndDateTime',
    component: 'NDatePicker',
    label: '预约出库日期',
    componentProps: {
      type: 'date',
      clearable: true,
    },
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
