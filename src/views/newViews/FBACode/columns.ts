import { DataTableColumns } from 'naive-ui';
import { FormField } from '@/views/bolita-views/composable/form-field-type';
import { FBACodeManager } from '@/api/dataLayer/modules/user/user';
import { uniq } from 'lodash-es';

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

export const filters: FormField[] = [
  asyncFBACodeKey('code', 'FBACode'),
  asyncFBACodeKey('state', '州'),
  asyncFBACodeKey('address', '地址'),
  asyncFBACodeKey('city', '城市'),
  asyncFBACodeKey('postcode', '邮编'),
];

export async function asyncFBACodeKey(field, label): Promise<FormField> {
  const FBACodeList = await getFBACodeKeyInfo(field);
  const list = FBACodeList.map((it) => ({
    label: it,
    value: it,
  }));
  return {
    field: field,
    label: label,
    component: 'NSelect',
    componentProps: {
      options: list,
    },
    required: false,
  };
}

export async function getFBACodeKeyInfo(key) {
  return uniq((await FBACodeManager.load()).map((it) => it[key]));
}
