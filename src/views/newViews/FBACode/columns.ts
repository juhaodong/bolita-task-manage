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
    title: '地址',
    key: 'address',
  },
  {
    title: '邮编',
    key: 'postCode',
  },
  {
    title: '国家',
    key: 'countryCode',
  },
];

export type FBACode = {
  code: number;
  state: number;
  address: number;
  postCode: number;
  countryCode: string;
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
    label: '地址',
    field: 'address',
  },
  {
    label: '邮编',
    field: 'postCode',
  },
  {
    label: '国家',
    field: 'countryCode',
  },
];
