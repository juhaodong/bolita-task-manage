import { DataTableColumns } from 'naive-ui';

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
    title: '城市',
    key: 'city',
  },
  {
    title: '邮编',
    key: 'postcode',
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
