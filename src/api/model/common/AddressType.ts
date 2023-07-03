import { generateOptionFromArray } from '@/utils/utils';
import { FormField } from '@/views/bolita-views/composable/form-field-type';

export enum AddressType {
  AMZ = 'AMZ',
  B2B = 'B2B',
  B2C = 'B2C',
}

export const addressType = Object.values(AddressType);

export const formFieldAddressTypeSelection: FormField = {
  label: '地址类型',
  field: 'addressType',
  component: 'NSelect',
  componentProps: {
    options: generateOptionFromArray(addressType),
  },
};
