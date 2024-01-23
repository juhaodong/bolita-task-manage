import { DataTableColumns } from 'naive-ui';
import { FormField } from '@/views/bolita-views/composable/form-field-type';

export const columns: DataTableColumns<FBACode> = [
  {
    title: 'FBA码',
    key: 'code',
  },
  {
    title: '州',
    key: 'state',
  },
  {
    title: '街道',
    key: 'street',
  },
  {
    title: '门牌号',
    key: 'houseNo',
  },
  {
    title: '地址附加',
    key: 'appendAddress',
  },
  {
    title: '城市',
    key: 'city',
  },
  {
    title: '邮编',
    key: 'postcode',
  },
  {
    title: '国家',
    key: 'country',
  },
];

export type FBACode = {
  code: number;
  state: number;
  street: string;
  houseNo: string;
  appendAddress: string;
  city: string;
  postcode: number;
  country: string;
};

export const filters: FormField[] = [
  {
    label: 'FBA码',
    field: 'code',
  },
  {
    label: '州',
    field: 'state',
  },
  {
    label: '街道',
    field: 'street',
  },
  {
    label: '门牌号',
    field: 'houseNo',
  },
  {
    label: '地址附加',
    field: 'appendAddress',
  },
  {
    label: '城市',
    field: 'city',
  },
  {
    label: '邮编',
    field: 'postcode',
  },
  {
    label: '国家',
    field: 'country',
  },
];
